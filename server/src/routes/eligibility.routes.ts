import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { evaluateEligibility } from '../services/eligibility.service';
import { createAuditLog } from '../services/audit.service';

const router = Router();

const evaluateBodySchema = z.object({
  schemeId: z.string().optional(),
});

/**
 * POST /api/eligibility/evaluate
 * Trigger eligibility evaluation for current student against one or all schemes
 */
router.post(
  '/evaluate',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { schemeId } = evaluateBodySchema.parse(req.body || {});

      // Find student profile
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!student) {
        return next(
          new AppError('Student profile not found. Please complete your registration.', 404)
        );
      }

      const results = await evaluateEligibility(student.id, schemeId);

      await createAuditLog({
        userId: req.user!.id,
        action: 'EVALUATE_ELIGIBILITY',
        entityType: 'StudentProfile',
        entityId: student.id,
        details: { schemeId: schemeId || 'ALL', schemesEvaluated: results.length },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Evaluated ${results.length} scheme(s) successfully`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/eligibility/me
 * Get all evaluations for the current authenticated student
 */
router.get(
  '/me',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!student) {
        return next(new AppError('Student profile not found', 404));
      }

      const evaluations = await prisma.eligibilityEvaluation.findMany({
        where: { studentProfileId: student.id },
        include: {
          scheme: {
            select: {
              id: true,
              schemeId: true,
              name: true,
              benefitType: true,
              benefitAmount: true,
              materialBenefitDescription: true,
            },
          },
        },
        orderBy: { evaluatedAt: 'desc' },
      });

      const parsedEvaluations = evaluations.map((item) => {
        let reasons = [];
        let missingInformation = [];
        let documentsRequired = [];

        try {
          reasons = JSON.parse(item.reasons);
        } catch {
          reasons = [item.reasons];
        }

        try {
          missingInformation = JSON.parse(item.missingInformation);
        } catch {
          missingInformation = [item.missingInformation];
        }

        try {
          documentsRequired = item.documentsRequired ? JSON.parse(item.documentsRequired) : [];
        } catch {
          documentsRequired = [];
        }

        return {
          ...item,
          reasons,
          missingInformation,
          documentsRequired,
        };
      });

      res.status(200).json({
        success: true,
        data: parsedEvaluations,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/eligibility/:evaluationId
 * Get specific eligibility evaluation details
 */
router.get(
  '/:evaluationId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { evaluationId } = req.params;

      const evaluation = await prisma.eligibilityEvaluation.findUnique({
        where: { id: evaluationId },
        include: {
          scheme: true,
          studentProfile: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              school: true,
              district: true,
            },
          },
        },
      });

      if (!evaluation) {
        return next(new AppError('Evaluation not found', 404));
      }

      // Check access permission
      const user = req.user!;
      if (user.role === 'STUDENT' && evaluation.studentProfile.userId !== user.id) {
        return next(new AppError('Forbidden: Access denied to this evaluation', 403));
      }

      if (
        (user.role === 'TEACHER' || user.role === 'PRINCIPAL') &&
        user.schoolId &&
        user.schoolId !== evaluation.studentProfile.schoolId
      ) {
        return next(new AppError('Forbidden: Access denied outside your school', 403));
      }

      if (
        user.role === 'DISTRICT_OFFICER' &&
        user.districtId &&
        user.districtId !== evaluation.studentProfile.districtId
      ) {
        return next(new AppError('Forbidden: Access denied outside your district', 403));
      }

      let reasons = [];
      let missingInformation = [];
      let documentsRequired = [];

      try {
        reasons = JSON.parse(evaluation.reasons);
      } catch {
        reasons = [evaluation.reasons];
      }

      try {
        missingInformation = JSON.parse(evaluation.missingInformation);
      } catch {
        missingInformation = [evaluation.missingInformation];
      }

      try {
        documentsRequired = evaluation.documentsRequired
          ? JSON.parse(evaluation.documentsRequired)
          : [];
      } catch {
        documentsRequired = [];
      }

      res.status(200).json({
        success: true,
        data: {
          ...evaluation,
          reasons,
          missingInformation,
          documentsRequired,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as eligibilityRouter };
