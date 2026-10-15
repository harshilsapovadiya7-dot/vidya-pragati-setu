import prisma from '../lib/prisma';

export interface RequiredDocStatus {
  documentCategory: string;
  description?: string | null;
  isMandatory: boolean;
  status: 'NOT_UPLOADED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface EligibilityResult {
  id: string;
  schemeId: string;
  schemeName: string;
  studentProfileId: string;
  status:
    | 'ELIGIBLE'
    | 'NOT_ELIGIBLE'
    | 'NEEDS_VERIFICATION'
    | 'INSUFFICIENT_INFORMATION'
    | 'APPLICATION_CLOSED';
  reasons: string[];
  missingInformation: string[];
  documentsRequired: RequiredDocStatus[];
  ruleVersion: number;
  evaluatedAt: Date;
}

/**
 * Evaluates rule operators safely
 */
function evaluateOperator(operator: string, studentValue: any, ruleTarget: any): boolean {
  if (studentValue === undefined || studentValue === null) {
    return false;
  }

  switch (operator) {
    case 'EQUALS': {
      if (typeof studentValue === 'string' && typeof ruleTarget === 'string') {
        return studentValue.trim().toUpperCase() === ruleTarget.trim().toUpperCase();
      }
      return studentValue === ruleTarget;
    }

    case 'NOT_EQUALS': {
      if (typeof studentValue === 'string' && typeof ruleTarget === 'string') {
        return studentValue.trim().toUpperCase() !== ruleTarget.trim().toUpperCase();
      }
      return studentValue !== ruleTarget;
    }

    case 'GREATER_THAN':
      return Number(studentValue) > Number(ruleTarget);

    case 'LESS_THAN':
      return Number(studentValue) < Number(ruleTarget);

    case 'GREATER_EQUAL':
      return Number(studentValue) >= Number(ruleTarget);

    case 'LESS_EQUAL':
      return Number(studentValue) <= Number(ruleTarget);

    case 'IN': {
      let targetArray: any[] = [];
      if (Array.isArray(ruleTarget)) {
        targetArray = ruleTarget;
      } else if (typeof ruleTarget === 'string') {
        try {
          const parsed = JSON.parse(ruleTarget);
          targetArray = Array.isArray(parsed) ? parsed : [ruleTarget];
        } catch {
          targetArray = ruleTarget.split(',').map((s) => s.trim());
        }
      }

      if (typeof studentValue === 'string') {
        return targetArray
          .map((v) => String(v).toUpperCase().trim())
          .includes(studentValue.toUpperCase().trim());
      }
      return targetArray.includes(studentValue);
    }

    case 'NOT_IN': {
      let targetArray: any[] = [];
      if (Array.isArray(ruleTarget)) {
        targetArray = ruleTarget;
      } else if (typeof ruleTarget === 'string') {
        try {
          const parsed = JSON.parse(ruleTarget);
          targetArray = Array.isArray(parsed) ? parsed : [ruleTarget];
        } catch {
          targetArray = ruleTarget.split(',').map((s) => s.trim());
        }
      }

      if (typeof studentValue === 'string') {
        return !targetArray
          .map((v) => String(v).toUpperCase().trim())
          .includes(studentValue.toUpperCase().trim());
      }
      return !targetArray.includes(studentValue);
    }

    case 'BETWEEN': {
      let range: [number, number] = [0, 0];
      if (Array.isArray(ruleTarget) && ruleTarget.length >= 2) {
        range = [Number(ruleTarget[0]), Number(ruleTarget[1])];
      } else if (typeof ruleTarget === 'string') {
        try {
          const parsed = JSON.parse(ruleTarget);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            range = [Number(parsed[0]), Number(parsed[1])];
          }
        } catch {
          const parts = ruleTarget.split(',').map(Number);
          if (parts.length >= 2) range = [parts[0], parts[1]];
        }
      }
      const numVal = Number(studentValue);
      return numVal >= range[0] && numVal <= range[1];
    }

    default:
      return false;
  }
}

/**
 * Evaluates scheme eligibility for a student profile
 */
export async function evaluateEligibility(
  studentProfileId: string,
  schemeId?: string
): Promise<EligibilityResult[]> {
  // 1. Fetch student profile with documents and relations
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      documents: true,
      school: true,
      district: true,
      user: true,
    },
  });

  if (!student) {
    throw new Error(`Student profile with ID ${studentProfileId} not found`);
  }

  // 2. Fetch schemes to evaluate
  const schemeFilter: any = { isEnabled: true };
  if (schemeId) {
    schemeFilter.id = schemeId;
  }

  const schemes = await prisma.scheme.findMany({
    where: schemeFilter,
    include: {
      rules: true,
      requiredDocuments: true,
    },
  });

  const now = new Date();
  const results: EligibilityResult[] = [];

  for (const scheme of schemes) {
    const reasons: string[] = [];
    const missingInformation: string[] = [];
    const requiredDocsStatus: RequiredDocStatus[] = [];

    let hasRuleFailure = false;
    let hasMissingInfo = false;
    let hasUnverifiedDocs = false;
    let isWindowClosed = false;

    // A. Check Application Window
    if (scheme.applicationStartDate && now < new Date(scheme.applicationStartDate)) {
      isWindowClosed = true;
      reasons.push(
        `Application window opens on ${new Date(scheme.applicationStartDate).toLocaleDateString()}`
      );
    } else if (scheme.applicationEndDate && now > new Date(scheme.applicationEndDate)) {
      isWindowClosed = true;
      reasons.push(
        `Application window closed on ${new Date(scheme.applicationEndDate).toLocaleDateString()}`
      );
    }

    // B. Check Eligible Grades defined at scheme level
    if (scheme.eligibleGrades) {
      try {
        let grades: number[] = [];
        if (typeof scheme.eligibleGrades === 'string') {
          const parsed = JSON.parse(scheme.eligibleGrades);
          grades = Array.isArray(parsed) ? parsed : [Number(parsed)];
        }
        if (grades.length > 0 && !grades.includes(student.currentGrade)) {
          hasRuleFailure = true;
          reasons.push(
            `Grade mismatch: Student is in Grade ${student.currentGrade}, but scheme is for Grades ${grades.join(', ')}`
          );
        } else if (grades.length > 0) {
          reasons.push(`Student is in eligible Grade ${student.currentGrade}`);
        }
      } catch (err) {
        console.error(`Error parsing eligibleGrades for scheme ${scheme.id}:`, err);
      }
    }

    // C. Check Current Rules for Current Rule Version
    const activeRules = scheme.rules.filter(
      (r) => r.ruleVersion === scheme.currentRuleVersion
    );

    for (const rule of activeRules) {
      let studentVal: any = undefined;

      switch (rule.parameterName) {
        case 'currentGrade':
          studentVal = student.currentGrade;
          break;
        case 'gender':
          studentVal = student.gender;
          break;
        case 'annualFamilyIncome':
          studentVal = student.annualFamilyIncome;
          break;
        case 'academicMarks':
          studentVal = student.academicMarks;
          break;
        case 'attendancePercentage':
          studentVal = student.attendancePercentage;
          break;
        case 'category':
          studentVal = student.category;
          break;
        default:
          studentVal = (student as any)[rule.parameterName];
      }

      // Check if student data is missing for a required rule
      if (studentVal === null || studentVal === undefined || studentVal === '') {
        if (rule.isRequired) {
          hasMissingInfo = true;
          missingInformation.push(rule.parameterName);
          reasons.push(
            `Missing student information: ${rule.description || rule.parameterName}`
          );
        }
        continue;
      }

      // Parse rule parameterValue
      let targetVal: any = rule.parameterValue;
      try {
        targetVal = JSON.parse(rule.parameterValue);
      } catch {
        targetVal = rule.parameterValue;
      }

      const passed = evaluateOperator(rule.operator, studentVal, targetVal);

      if (passed) {
        reasons.push(
          `Satisfied rule: ${rule.description || `${rule.parameterName} ${rule.operator} ${JSON.stringify(targetVal)}`}`
        );
      } else {
        if (rule.isRequired) {
          hasRuleFailure = true;
        }
        reasons.push(
          `Failed criteria: ${rule.description || `${rule.parameterName} must be ${rule.operator} ${JSON.stringify(targetVal)} (Current: ${studentVal})`}`
        );
      }
    }

    // D. Check Required Documents
    for (const reqDoc of scheme.requiredDocuments) {
      // Find matching uploaded document for student
      const uploadedDocs = student.documents.filter(
        (d) => d.documentCategory === reqDoc.documentCategory
      );

      let docState: RequiredDocStatus['status'] = 'NOT_UPLOADED';

      if (uploadedDocs.length > 0) {
        // Look for verified first
        const isVerified = uploadedDocs.some((d) => d.verificationStatus === 'VERIFIED');
        const isPending = uploadedDocs.some((d) => d.verificationStatus === 'PENDING');
        const isRejected = uploadedDocs.every((d) => d.verificationStatus === 'REJECTED');

        if (isVerified) {
          docState = 'VERIFIED';
        } else if (isPending) {
          docState = 'PENDING';
        } else if (isRejected) {
          docState = 'REJECTED';
        }
      }

      requiredDocsStatus.push({
        documentCategory: reqDoc.documentCategory,
        description: reqDoc.description,
        isMandatory: reqDoc.isMandatory,
        status: docState,
      });

      if (reqDoc.isMandatory) {
        if (docState === 'NOT_UPLOADED') {
          hasUnverifiedDocs = true;
          missingInformation.push(`DOCUMENT_${reqDoc.documentCategory}`);
          reasons.push(`Mandatory document required: ${reqDoc.documentCategory}`);
        } else if (docState === 'PENDING') {
          hasUnverifiedDocs = true;
          reasons.push(`Document verification pending: ${reqDoc.documentCategory}`);
        } else if (docState === 'REJECTED') {
          hasUnverifiedDocs = true;
          reasons.push(`Document rejected, re-upload needed: ${reqDoc.documentCategory}`);
        } else if (docState === 'VERIFIED') {
          reasons.push(`Verified document provided: ${reqDoc.documentCategory}`);
        }
      }
    }

    // E. Determine Final Status
    let overallStatus: EligibilityResult['status'];

    if (isWindowClosed) {
      overallStatus = 'APPLICATION_CLOSED';
    } else if (hasRuleFailure) {
      overallStatus = 'NOT_ELIGIBLE';
    } else if (hasMissingInfo) {
      overallStatus = 'INSUFFICIENT_INFORMATION';
    } else if (hasUnverifiedDocs) {
      overallStatus = 'NEEDS_VERIFICATION';
    } else {
      overallStatus = 'ELIGIBLE';
    }

    // F. Persist Evaluation in Database
    const savedEvaluation = await prisma.eligibilityEvaluation.create({
      data: {
        studentProfileId: student.id,
        schemeId: scheme.id,
        status: overallStatus,
        reasons: JSON.stringify(reasons),
        missingInformation: JSON.stringify(missingInformation),
        documentsRequired: JSON.stringify(requiredDocsStatus),
        ruleVersion: scheme.currentRuleVersion,
        evaluatedAt: now,
      },
    });

    results.push({
      id: savedEvaluation.id,
      schemeId: scheme.id,
      schemeName: scheme.name,
      studentProfileId: student.id,
      status: overallStatus,
      reasons,
      missingInformation,
      documentsRequired: requiredDocsStatus,
      ruleVersion: scheme.currentRuleVersion,
      evaluatedAt: savedEvaluation.evaluatedAt,
    });
  }

  return results;
}
