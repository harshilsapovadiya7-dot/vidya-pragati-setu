import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../services/audit.service';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vps-dev-jwt-secret-change-in-production-2024';

const ruleInputSchema = z.object({
  parameterName: z.string().min(1),
  operator: z.enum([
    'EQUALS',
    'NOT_EQUALS',
    'GREATER_THAN',
    'LESS_THAN',
    'GREATER_EQUAL',
    'LESS_EQUAL',
    'IN',
    'NOT_IN',
    'BETWEEN',
  ]),
  parameterValue: z.union([z.string(), z.number(), z.array(z.any()), z.boolean()]),
  isRequired: z.boolean().default(true),
  description: z.string().optional(),
});

const reqDocInputSchema = z.object({
  documentCategory: z.enum([
    'IDENTITY',
    'INCOME_CERTIFICATE',
    'CASTE_CERTIFICATE',
    'MARKSHEET',
    'ENROLLMENT_CERTIFICATE',
    'BANK_PROOF',
    'PHOTOGRAPH',
    'OTHER',
  ]),
  description: z.string().optional(),
  isMandatory: z.boolean().default(true),
});

const createSchemeSchema = z.object({
  schemeId: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  description: z.string().min(5),
  benefitType: z.enum(['FINANCIAL', 'MATERIAL', 'BOTH']),
  eligibleGrades: z.array(z.number()).or(z.string()),
  applicationStartDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  applicationEndDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  benefitAmount: z.number().nonnegative().optional(),
  materialBenefitDescription: z.string().optional(),
  rules: z.array(ruleInputSchema).optional(),
  requiredDocuments: z.array(reqDocInputSchema).optional(),
});

const updateSchemeSchema = createSchemeSchema.partial();

/**
 * Helper to optionally parse user from token without throwing
 */
async function getOptionalUser(req: Request) {
  try {
    let token: string | undefined;
    if (req.cookies && req.cookies.vps_token) {
      token = req.cookies.vps_token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded?.userId) return null;
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { studentProfile: true },
    });
  } catch {
    return null;
  }
}

/**
 * GET /api/schemes
 * List all enabled schemes with filtering and student evaluations
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { grade, benefitType, category, search } = req.query;

    const whereClause: any = { isEnabled: true };

    if (benefitType) {
      whereClause.benefitType = benefitType as string;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { schemeId: { contains: search as string } },
      ];
    }

    const schemes = await prisma.scheme.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            requiredDocuments: true,
            rules: true,
            applications: true,
          },
        },
        requiredDocuments: true,
        rules: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Grade filtering
    let filteredSchemes = schemes;
    if (grade) {
      const gradeNum = parseInt(grade as string, 10);
      filteredSchemes = filteredSchemes.filter((scheme) => {
        try {
          const grades: number[] = JSON.parse(scheme.eligibleGrades);
          return Array.isArray(grades) && grades.includes(gradeNum);
        } catch {
          return true;
        }
      });
    }

    // Category filtering
    if (category) {
      filteredSchemes = filteredSchemes.filter((scheme) => {
        const catRule = scheme.rules.find((r) => r.parameterName === 'category');
        if (!catRule) return true;
        try {
          const catVals = JSON.parse(catRule.parameterValue);
          if (Array.isArray(catVals)) {
            return catVals.includes(category);
          }
          return catVals === category;
        } catch {
          return catRule.parameterValue.includes(category as string);
        }
      });
    }

    // Attach student evaluations if student is logged in
    const optionalUser = await getOptionalUser(req);
    let results: any[] = filteredSchemes;

    if (optionalUser?.studentProfile?.id) {
      const studentId = optionalUser.studentProfile.id;
      const evaluations = await prisma.eligibilityEvaluation.findMany({
        where: { studentProfileId: studentId },
        orderBy: { evaluatedAt: 'desc' },
      });

      results = filteredSchemes.map((scheme) => {
        const latestEvaluation = evaluations.find((e) => e.schemeId === scheme.id);
        let parsedEval = null;
        if (latestEvaluation) {
          try {
            parsedEval = {
              ...latestEvaluation,
              reasons: JSON.parse(latestEvaluation.reasons),
              missingInformation: JSON.parse(latestEvaluation.missingInformation),
              documentsRequired: latestEvaluation.documentsRequired
                ? JSON.parse(latestEvaluation.documentsRequired)
                : [],
            };
          } catch {
            parsedEval = latestEvaluation;
          }
        }
        return {
          ...scheme,
          latestEvaluation: parsedEval,
        };
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/schemes/:id
 * Retrieve scheme details by id or schemeId
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const scheme = await prisma.scheme.findFirst({
      where: {
        OR: [{ id }, { schemeId: id }],
      },
      include: {
        rules: {
          orderBy: { createdAt: 'asc' },
        },
        requiredDocuments: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!scheme) {
      return next(new AppError('Scheme not found', 404));
    }

    res.status(200).json({
      success: true,
      data: scheme,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/schemes
 * Create a new scheme with rules and required documents
 */
router.post(
  '/',
  authenticate,
  requireRole('STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createSchemeSchema.parse(req.body);

      const existing = await prisma.scheme.findUnique({
        where: { schemeId: validatedData.schemeId },
      });

      if (existing) {
        return next(
          new AppError(`A scheme with schemeId '${validatedData.schemeId}' already exists.`, 409)
        );
      }

      const eligibleGradesString =
        typeof validatedData.eligibleGrades === 'string'
          ? validatedData.eligibleGrades
          : JSON.stringify(validatedData.eligibleGrades);

      const newScheme = await prisma.scheme.create({
        data: {
          schemeId: validatedData.schemeId,
          name: validatedData.name,
          description: validatedData.description,
          benefitType: validatedData.benefitType,
          eligibleGrades: eligibleGradesString,
          applicationStartDate: validatedData.applicationStartDate
            ? new Date(validatedData.applicationStartDate)
            : null,
          applicationEndDate: validatedData.applicationEndDate
            ? new Date(validatedData.applicationEndDate)
            : null,
          benefitAmount: validatedData.benefitAmount,
          materialBenefitDescription: validatedData.materialBenefitDescription,
          isEnabled: true,
          currentRuleVersion: 1,
          rules: validatedData.rules
            ? {
                create: validatedData.rules.map((rule) => ({
                  parameterName: rule.parameterName,
                  operator: rule.operator,
                  parameterValue:
                    typeof rule.parameterValue === 'string'
                      ? rule.parameterValue
                      : JSON.stringify(rule.parameterValue),
                  isRequired: rule.isRequired ?? true,
                  description: rule.description,
                  ruleVersion: 1,
                })),
              }
            : undefined,
          requiredDocuments: validatedData.requiredDocuments
            ? {
                create: validatedData.requiredDocuments.map((doc) => ({
                  documentCategory: doc.documentCategory,
                  description: doc.description,
                  isMandatory: doc.isMandatory ?? true,
                })),
              }
            : undefined,
        },
        include: {
          rules: true,
          requiredDocuments: true,
        },
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'CREATE_SCHEME',
        entityType: 'Scheme',
        entityId: newScheme.id,
        details: { schemeId: newScheme.schemeId, name: newScheme.name },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Scheme created successfully',
        data: newScheme,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/schemes/:id
 * Update an existing scheme
 */
router.put(
  '/:id',
  authenticate,
  requireRole('STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateSchemeSchema.parse(req.body);

      const existing = await prisma.scheme.findFirst({
        where: { OR: [{ id }, { schemeId: id }] },
      });

      if (!existing) {
        return next(new AppError('Scheme not found', 404));
      }

      const updateData: any = {};
      if (validatedData.name) updateData.name = validatedData.name;
      if (validatedData.description) updateData.description = validatedData.description;
      if (validatedData.benefitType) updateData.benefitType = validatedData.benefitType;
      if (validatedData.eligibleGrades !== undefined) {
        updateData.eligibleGrades =
          typeof validatedData.eligibleGrades === 'string'
            ? validatedData.eligibleGrades
            : JSON.stringify(validatedData.eligibleGrades);
      }
      if (validatedData.applicationStartDate !== undefined) {
        updateData.applicationStartDate = validatedData.applicationStartDate
          ? new Date(validatedData.applicationStartDate)
          : null;
      }
      if (validatedData.applicationEndDate !== undefined) {
        updateData.applicationEndDate = validatedData.applicationEndDate
          ? new Date(validatedData.applicationEndDate)
          : null;
      }
      if (validatedData.benefitAmount !== undefined) {
        updateData.benefitAmount = validatedData.benefitAmount;
      }
      if (validatedData.materialBenefitDescription !== undefined) {
        updateData.materialBenefitDescription = validatedData.materialBenefitDescription;
      }

      const updatedScheme = await prisma.scheme.update({
        where: { id: existing.id },
        data: updateData,
        include: {
          rules: true,
          requiredDocuments: true,
        },
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'UPDATE_SCHEME',
        entityType: 'Scheme',
        entityId: updatedScheme.id,
        details: { fields: Object.keys(validatedData) },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Scheme updated successfully',
        data: updatedScheme,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/schemes/:id/publish
 * Increment current rule version and mark scheme active
 */
router.post(
  '/:id/publish',
  authenticate,
  requireRole('STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const scheme = await prisma.scheme.findFirst({
        where: { OR: [{ id }, { schemeId: id }] },
      });

      if (!scheme) {
        return next(new AppError('Scheme not found', 404));
      }

      const updated = await prisma.scheme.update({
        where: { id: scheme.id },
        data: {
          currentRuleVersion: scheme.currentRuleVersion + 1,
          isEnabled: true,
        },
        include: {
          rules: true,
          requiredDocuments: true,
        },
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'PUBLISH_SCHEME_VERSION',
        entityType: 'Scheme',
        entityId: updated.id,
        details: {
          previousVersion: scheme.currentRuleVersion,
          newVersion: updated.currentRuleVersion,
        },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Scheme published with version ${updated.currentRuleVersion}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as schemeRouter };
