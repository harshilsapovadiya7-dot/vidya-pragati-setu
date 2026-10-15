import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole, requireSchoolAccess, requireDistrictAccess } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createAuditLog } from '../services/audit.service';

const router = Router();

const updateStudentSchema = z.object({
  parentGuardianName: z.string().min(2).max(100).optional(),
  parentGuardianContact: z.string().regex(/^[0-9]{10}$/, 'Must be a valid 10-digit number').optional(),
  annualFamilyIncome: z.number().nonnegative().optional(),
  taluka: z.string().max(100).optional(),
  academicMarks: z.number().min(0).max(100).optional(),
  attendancePercentage: z.number().min(0).max(100).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  category: z.enum(['GENERAL', 'SC', 'ST', 'OBC', 'MINORITY', 'EWS']).optional(),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

/**
 * Calculates profile completion percentage based on student profile attributes
 */
function calculateProfileCompletion(profile: any): number {
  const fields = [
    Boolean(profile.dateOfBirth),
    Boolean(profile.gender),
    Boolean(profile.parentGuardianName),
    Boolean(profile.parentGuardianContact),
    profile.annualFamilyIncome !== null && profile.annualFamilyIncome !== undefined,
    profile.academicMarks !== null && profile.academicMarks !== undefined,
    profile.attendancePercentage !== null && profile.attendancePercentage !== undefined,
    Boolean(profile.category),
    Boolean(profile.bankAccountVerified),
    Array.isArray(profile.documents) && profile.documents.length > 0,
  ];

  const completedCount = fields.filter(Boolean).length;
  return Math.round((completedCount / fields.length) * 100);
}

/**
 * GET /api/students/me
 * Get current student's full profile
 */
router.get(
  '/me',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return next(new AppError('Unauthorized', 401));
      }

      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          school: true,
          district: true,
          documents: true,
          evaluations: {
            orderBy: { evaluatedAt: 'desc' },
            take: 10,
            include: {
              scheme: {
                select: { id: true, schemeId: true, name: true, benefitType: true },
              },
            },
          },
          applications: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              scheme: true,
              statusHistory: {
                orderBy: { timestamp: 'desc' },
                take: 1,
              },
            },
          },
          assets: {
            include: {
              scheme: true,
              verification: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { scheme: true },
          },
        },
      });

      if (!profile) {
        return next(new AppError('Student profile not found', 404));
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/students/me
 * Update student profile non-sensitive fields
 */
router.put(
  '/me',
  authenticate,
  requireRole('STUDENT'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        return next(new AppError('Unauthorized', 401));
      }

      const validatedData = updateStudentSchema.parse(req.body);

      const existingProfile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
        include: { documents: true },
      });

      if (!existingProfile) {
        return next(new AppError('Student profile not found', 404));
      }

      // Convert date string if present
      const updatePayload: any = { ...validatedData };
      if (validatedData.dateOfBirth) {
        updatePayload.dateOfBirth = new Date(validatedData.dateOfBirth);
      }

      const prospectiveProfile = {
        ...existingProfile,
        ...updatePayload,
      };

      const completionPercentage = calculateProfileCompletion(prospectiveProfile);
      updatePayload.profileCompletionPercentage = completionPercentage;

      const updatedProfile = await prisma.studentProfile.update({
        where: { id: existingProfile.id },
        data: updatePayload,
        include: {
          school: true,
          district: true,
          documents: true,
        },
      });

      await createAuditLog({
        userId: req.user.id,
        action: 'UPDATE_STUDENT_PROFILE',
        entityType: 'StudentProfile',
        entityId: updatedProfile.id,
        details: { fieldsUpdated: Object.keys(validatedData) },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/students/:id
 * Get student by profile ID (staff access)
 */
router.get(
  '/:id',
  authenticate,
  requireRole('TEACHER', 'PRINCIPAL', 'DISTRICT_OFFICER', 'STATE_ADMIN'),
  requireSchoolAccess,
  requireDistrictAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const profile = await prisma.studentProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          school: true,
          district: true,
          documents: true,
          evaluations: {
            orderBy: { evaluatedAt: 'desc' },
            include: { scheme: true },
          },
          applications: {
            orderBy: { createdAt: 'desc' },
            include: {
              scheme: true,
              statusHistory: true,
              payments: true,
            },
          },
          assets: {
            include: {
              scheme: true,
              verification: true,
              trackingEvents: { orderBy: { timestamp: 'desc' } },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            include: { scheme: true },
          },
        },
      });

      if (!profile) {
        return next(new AppError('Student profile not found', 404));
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/students/:id/schemes
 * Get all enabled schemes with latest student eligibility
 */
router.get(
  '/:id/schemes',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Access authorization: Student can only view their own; staff based on permissions
      if (req.user?.role === 'STUDENT' && req.user.studentProfileId !== id) {
        return next(new AppError('Forbidden: You can only view your own schemes', 403));
      }

      const student = await prisma.studentProfile.findUnique({
        where: { id },
        include: { school: true, district: true },
      });

      if (!student) {
        return next(new AppError('Student profile not found', 404));
      }

      const schemes = await prisma.scheme.findMany({
        where: { isEnabled: true },
        include: {
          rules: true,
          requiredDocuments: true,
          _count: { select: { applications: true } },
        },
      });

      const evaluations = await prisma.eligibilityEvaluation.findMany({
        where: { studentProfileId: id },
        orderBy: { evaluatedAt: 'desc' },
      });

      const schemesWithEligibility = schemes.map((scheme) => {
        const latestEvaluation = evaluations.find((e) => e.schemeId === scheme.id);
        let parsedEvaluation = null;

        if (latestEvaluation) {
          try {
            parsedEvaluation = {
              ...latestEvaluation,
              reasons: JSON.parse(latestEvaluation.reasons),
              missingInformation: JSON.parse(latestEvaluation.missingInformation),
              documentsRequired: latestEvaluation.documentsRequired
                ? JSON.parse(latestEvaluation.documentsRequired)
                : [],
            };
          } catch {
            parsedEvaluation = latestEvaluation;
          }
        }

        return {
          ...scheme,
          latestEvaluation: parsedEvaluation,
        };
      });

      res.status(200).json({
        success: true,
        data: schemesWithEligibility,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as studentRouter };
