import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateApplicationRef, generatePaymentRef } from '../utils/generateId';
import { evaluateEligibility } from '../services/eligibility.service';
import { createNotification } from '../services/notification.service';
import { createAuditLog } from '../services/audit.service';

const router = Router();

const createApplicationSchema = z.object({
  schemeId: z.string().min(1, 'Scheme ID is required'),
  academicYear: z.string().default('2024-25'),
  schemeSpecificData: z.record(z.any()).optional(),
});

const updateApplicationSchema = z.object({
  schemeSpecificData: z.record(z.any()),
});

const correctionSchema = z.object({
  reason: z.string().min(5, 'Correction reason must be at least 5 characters long'),
});

const reviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'forward']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/applications
 * List applications filtered by user role and query parameters
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const {
      status,
      schemeId,
      academicYear = '2024-25',
      page = '1',
      limit = '20',
      schoolId,
      districtId,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const whereClause: any = {};

    if (academicYear) {
      whereClause.academicYear = academicYear as string;
    }

    if (schemeId) {
      whereClause.schemeId = schemeId as string;
    }

    if (status) {
      whereClause.status = status as string;
    }

    // Role-based filtering
    if (user.role === 'STUDENT') {
      if (!user.studentProfileId) {
        return next(new AppError('Student profile not found', 404));
      }
      whereClause.studentProfileId = user.studentProfileId;
    } else if (user.role === 'PRINCIPAL' || user.role === 'TEACHER') {
      const targetSchool = user.schoolId || (schoolId as string);
      if (targetSchool) {
        whereClause.studentProfile = { schoolId: targetSchool };
      }
      // If no explicit status requested, default to reviews relevant to school
      if (!status) {
        whereClause.status = { in: ['SUBMITTED', 'SCHOOL_REVIEW', 'CORRECTION_REQUIRED'] };
      }
    } else if (user.role === 'DISTRICT_OFFICER') {
      const targetDistrict = user.districtId || (districtId as string);
      if (targetDistrict) {
        whereClause.studentProfile = { districtId: targetDistrict };
      }
      if (!status) {
        whereClause.status = { in: ['DISTRICT_REVIEW', 'APPROVED', 'REJECTED'] };
      }
    } else if (user.role === 'STATE_ADMIN') {
      if (schoolId) {
        whereClause.studentProfile = { schoolId: schoolId as string };
      }
      if (districtId) {
        whereClause.studentProfile = {
          ...(whereClause.studentProfile || {}),
          districtId: districtId as string,
        };
      }
    }

    const [applications, total] = await Promise.all([
      prisma.scholarshipApplication.findMany({
        where: whereClause,
        include: {
          scheme: {
            select: {
              id: true,
              schemeId: true,
              name: true,
              benefitType: true,
              benefitAmount: true,
            },
          },
          studentProfile: {
            select: {
              id: true,
              studentId: true,
              currentGrade: true,
              gender: true,
              category: true,
              school: { select: { id: true, name: true, udiseCode: true } },
              district: { select: { id: true, name: true, code: true } },
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          statusHistory: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.scholarshipApplication.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/applications/:id
 * Retrieve application details with full history
 */
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const application = await prisma.scholarshipApplication.findFirst({
      where: {
        OR: [{ id }, { applicationRef: id }],
      },
      include: {
        scheme: {
          include: {
            requiredDocuments: true,
            rules: true,
          },
        },
        studentProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            school: true,
            district: true,
            documents: true,
          },
        },
        statusHistory: {
          orderBy: { timestamp: 'asc' },
        },
        payments: true,
      },
    });

    if (!application) {
      return next(new AppError('Scholarship application not found', 404));
    }

    // Role-based access validation
    if (user.role === 'STUDENT' && application.studentProfile.userId !== user.id) {
      return next(new AppError('Forbidden: Access denied to this application', 403));
    }

    if (
      (user.role === 'PRINCIPAL' || user.role === 'TEACHER') &&
      user.schoolId &&
      application.studentProfile.schoolId !== user.schoolId
    ) {
      return next(new AppError('Forbidden: Access denied outside your school', 403));
    }

    if (
      user.role === 'DISTRICT_OFFICER' &&
      user.districtId &&
      application.studentProfile.districtId !== user.districtId
    ) {
      return next(new AppError('Forbidden: Access denied outside your district', 403));
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/applications
 * Create draft scholarship application
 */
router.post(
  '/',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { schemeId, academicYear = '2024-25', schemeSpecificData } =
        createApplicationSchema.parse(req.body);

      const student = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
      });

      if (!student) {
        return next(
          new AppError('Student profile not found. Please complete your profile first.', 404)
        );
      }

      // Check scheme existence
      const scheme = await prisma.scheme.findFirst({
        where: { OR: [{ id: schemeId }, { schemeId }] },
      });

      if (!scheme || !scheme.isEnabled) {
        return next(new AppError('Requested scheme is inactive or not found', 404));
      }

      // Check for duplicate application for the same academic year
      const existingApp = await prisma.scholarshipApplication.findUnique({
        where: {
          studentProfileId_schemeId_academicYear: {
            studentProfileId: student.id,
            schemeId: scheme.id,
            academicYear,
          },
        },
      });

      if (existingApp) {
        return next(
          new AppError(
            `You have already submitted an application (${existingApp.applicationRef}) for this scheme in ${academicYear}.`,
            409
          )
        );
      }

      // Perform eligibility pre-check
      const evalResults = await evaluateEligibility(student.id, scheme.id);
      const evalResult = evalResults[0];

      if (evalResult && evalResult.status === 'NOT_ELIGIBLE') {
        return next(
          new AppError(
            `You are not eligible for this scheme: ${evalResult.reasons.filter((r) => r.startsWith('Failed criteria') || r.startsWith('Grade mismatch')).join(', ')}`,
            400
          )
        );
      }

      const applicationRef = await generateApplicationRef('2024');

      const newApplication = await prisma.scholarshipApplication.create({
        data: {
          applicationRef,
          studentProfileId: student.id,
          schemeId: scheme.id,
          academicYear,
          status: 'DRAFT',
          schemeSpecificData: schemeSpecificData ? JSON.stringify(schemeSpecificData) : null,
          ruleVersionUsed: scheme.currentRuleVersion,
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: 'DRAFT',
              changedBy: user.id,
              reason: 'Initial application draft created',
            },
          },
        },
        include: {
          scheme: true,
          statusHistory: true,
        },
      });

      await createAuditLog({
        userId: user.id,
        action: 'CREATE_APPLICATION_DRAFT',
        entityType: 'ScholarshipApplication',
        entityId: newApplication.id,
        details: { applicationRef: newApplication.applicationRef, schemeId: scheme.schemeId },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Application draft created successfully',
        data: newApplication,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/applications/:id
 * Update draft scholarship application
 */
router.put(
  '/:id',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { schemeSpecificData } = updateApplicationSchema.parse(req.body);

      const application = await prisma.scholarshipApplication.findUnique({
        where: { id },
        include: { studentProfile: true },
      });

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      if (application.studentProfile.userId !== req.user!.id) {
        return next(new AppError('Forbidden: Access denied to this application', 403));
      }

      if (application.status !== 'DRAFT' && application.status !== 'CORRECTION_REQUIRED') {
        return next(
          new AppError(
            `Cannot modify application with current status '${application.status}'. Only DRAFT or CORRECTION_REQUIRED can be updated.`,
            400
          )
        );
      }

      const updated = await prisma.scholarshipApplication.update({
        where: { id },
        data: {
          schemeSpecificData: JSON.stringify(schemeSpecificData),
        },
      });

      res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/applications/:id/submit
 * Student formally submits draft application
 */
router.post(
  '/:id/submit',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const application = await prisma.scholarshipApplication.findUnique({
        where: { id },
        include: {
          scheme: {
            include: { requiredDocuments: true },
          },
          studentProfile: {
            include: {
              documents: true,
              school: true,
            },
          },
        },
      });

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      if (application.studentProfile.userId !== user.id) {
        return next(new AppError('Forbidden: Access denied to this application', 403));
      }

      if (application.status !== 'DRAFT' && application.status !== 'CORRECTION_REQUIRED') {
        return next(
          new AppError(
            `Application cannot be submitted from current status '${application.status}'`,
            400
          )
        );
      }

      // Check required documents
      const mandatoryDocs = application.scheme.requiredDocuments.filter((d) => d.isMandatory);
      const studentDocs = application.studentProfile.documents;

      const missingDocs: string[] = [];
      const rejectedDocs: string[] = [];

      for (const reqDoc of mandatoryDocs) {
        const foundDocs = studentDocs.filter(
          (d) => d.documentCategory === reqDoc.documentCategory
        );
        if (foundDocs.length === 0) {
          missingDocs.push(reqDoc.documentCategory);
        } else if (foundDocs.every((d) => d.verificationStatus === 'REJECTED')) {
          rejectedDocs.push(reqDoc.documentCategory);
        }
      }

      if (missingDocs.length > 0) {
        return next(
          new AppError(
            `Missing mandatory documents: ${missingDocs.join(', ')}. Please upload them before submitting.`,
            400
          )
        );
      }

      if (rejectedDocs.length > 0) {
        return next(
          new AppError(
            `The following mandatory documents were rejected and need replacement: ${rejectedDocs.join(', ')}`,
            400
          )
        );
      }

      const prevStatus = application.status;
      const updatedApplication = await prisma.scholarshipApplication.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          correctionReason: null,
          statusHistory: {
            create: {
              fromStatus: prevStatus,
              toStatus: 'SUBMITTED',
              changedBy: user.id,
              reason:
                prevStatus === 'CORRECTION_REQUIRED'
                  ? 'Resubmitted with requested corrections'
                  : 'Submitted by student for verification',
            },
          },
        },
        include: {
          scheme: true,
          statusHistory: { orderBy: { timestamp: 'desc' } },
        },
      });

      await createNotification({
        userId: user.id,
        title: 'Application Submitted',
        message: `Your application (${application.applicationRef}) for ${application.scheme.name} was successfully submitted and is pending school review.`,
        type: 'SUCCESS',
        relatedEntityType: 'ScholarshipApplication',
        relatedEntityId: application.id,
      });

      await createAuditLog({
        userId: user.id,
        action: 'SUBMIT_APPLICATION',
        entityType: 'ScholarshipApplication',
        entityId: application.id,
        details: { applicationRef: application.applicationRef, previousStatus: prevStatus },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Application submitted successfully',
        data: updatedApplication,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/applications/:id/request-correction
 * Principal or District Officer requests corrections from student
 */
router.post(
  '/:id/request-correction',
  authenticate,
  requireRole('PRINCIPAL', 'DISTRICT_OFFICER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = correctionSchema.parse(req.body);

      const application = await prisma.scholarshipApplication.findUnique({
        where: { id },
        include: {
          scheme: true,
          studentProfile: { include: { user: true } },
        },
      });

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      const prevStatus = application.status;
      const updated = await prisma.scholarshipApplication.update({
        where: { id },
        data: {
          status: 'CORRECTION_REQUIRED',
          correctionReason: reason,
          statusHistory: {
            create: {
              fromStatus: prevStatus,
              toStatus: 'CORRECTION_REQUIRED',
              changedBy: req.user!.id,
              reason,
            },
          },
        },
      });

      await createNotification({
        userId: application.studentProfile.userId,
        title: 'Application Correction Required',
        message: `Corrections requested on your application (${application.applicationRef}) for ${application.scheme.name}. Reason: ${reason}`,
        type: 'ACTION_REQUIRED',
        relatedEntityType: 'ScholarshipApplication',
        relatedEntityId: application.id,
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'REQUEST_APPLICATION_CORRECTION',
        entityType: 'ScholarshipApplication',
        entityId: application.id,
        details: { reason, applicationRef: application.applicationRef },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Correction requested successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/applications/:id/review
 * Review workflow: Principal / District Officer / State Admin
 */
router.post(
  '/:id/review',
  authenticate,
  requireRole('PRINCIPAL', 'DISTRICT_OFFICER', 'STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { action, reason, notes } = reviewSchema.parse(req.body);
      const user = req.user!;

      const application = await prisma.scholarshipApplication.findUnique({
        where: { id },
        include: {
          scheme: true,
          studentProfile: { include: { user: true } },
        },
      });

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      const currentStatus = application.status;
      let nextStatus = currentStatus;
      const updateData: any = {};
      const historyReason = reason || notes || `Review decision: ${action}`;

      // Status transitions
      if (currentStatus === 'SUBMITTED' || currentStatus === 'SCHOOL_REVIEW') {
        if (action === 'forward' || action === 'approve') {
          nextStatus = 'DISTRICT_REVIEW';
          updateData.schoolReviewedAt = new Date();
          updateData.schoolReviewedBy = user.id;
        } else if (action === 'reject') {
          nextStatus = 'REJECTED';
          updateData.rejectionReason = reason || 'Rejected at school review stage';
          updateData.schoolReviewedAt = new Date();
          updateData.schoolReviewedBy = user.id;
        }
      } else if (currentStatus === 'DISTRICT_REVIEW') {
        if (action === 'approve') {
          nextStatus = 'APPROVED';
          updateData.districtReviewedAt = new Date();
          updateData.districtReviewedBy = user.id;
          updateData.approvalNotes = notes || 'Approved by district authority';
        } else if (action === 'reject') {
          nextStatus = 'REJECTED';
          updateData.rejectionReason = reason || 'Rejected at district review stage';
          updateData.districtReviewedAt = new Date();
          updateData.districtReviewedBy = user.id;
        }
      } else {
        return next(
          new AppError(
            `Application in status '${currentStatus}' cannot be reviewed with action '${action}'`,
            400
          )
        );
      }

      updateData.status = nextStatus;

      // Execute update with status history
      const updatedApplication = await prisma.scholarshipApplication.update({
        where: { id },
        data: {
          ...updateData,
          statusHistory: {
            create: {
              fromStatus: currentStatus,
              toStatus: nextStatus,
              changedBy: user.id,
              reason: historyReason,
            },
          },
        },
        include: {
          scheme: true,
          statusHistory: { orderBy: { timestamp: 'desc' } },
        },
      });

      // Handle financial scheme automated payment initiation upon final approval
      if (
        nextStatus === 'APPROVED' &&
        (application.scheme.benefitType === 'FINANCIAL' ||
          application.scheme.benefitType === 'BOTH')
      ) {
        const paymentRef = await generatePaymentRef('2024');

        await prisma.paymentRecord.create({
          data: {
            paymentRef,
            studentProfileId: application.studentProfileId,
            applicationId: application.id,
            schemeId: application.schemeId,
            academicYear: application.academicYear,
            approvedAmount: application.scheme.benefitAmount || 0,
            paymentStatus: 'INITIATED',
          },
        });

        // Automatically advance application to PAYMENT_PENDING
        await prisma.scholarshipApplication.update({
          where: { id },
          data: {
            status: 'PAYMENT_PENDING',
            statusHistory: {
              create: {
                fromStatus: 'APPROVED',
                toStatus: 'PAYMENT_PENDING',
                changedBy: 'SYSTEM',
                reason: 'Automated payment processing initiated for approved benefit',
              },
            },
          },
        });
      }

      // Notify student
      let notifTitle = `Application ${nextStatus}`;
      let notifType = 'INFO';

      if (nextStatus === 'APPROVED' || nextStatus === 'PAYMENT_PENDING') {
        notifTitle = 'Application Approved!';
        notifType = 'SUCCESS';
      } else if (nextStatus === 'REJECTED') {
        notifTitle = 'Application Not Approved';
        notifType = 'WARNING';
      }

      await createNotification({
        userId: application.studentProfile.userId,
        title: notifTitle,
        message: `Your application (${application.applicationRef}) has progressed to status: ${nextStatus}. ${historyReason}`,
        type: notifType,
        relatedEntityType: 'ScholarshipApplication',
        relatedEntityId: application.id,
      });

      await createAuditLog({
        userId: user.id,
        action: `APPLICATION_REVIEW_${action.toUpperCase()}`,
        entityType: 'ScholarshipApplication',
        entityId: application.id,
        details: {
          fromStatus: currentStatus,
          toStatus: nextStatus,
          action,
          reason: historyReason,
        },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Application reviewed successfully. New status: ${nextStatus}`,
        data: updatedApplication,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as applicationRouter };
