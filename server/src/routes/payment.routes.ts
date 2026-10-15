import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from '../services/notification.service';
import { createAuditLog } from '../services/audit.service';

const router = Router();

const simulateStatusSchema = z.object({
  targetStatus: z
    .enum([
      'INITIATED',
      'BANK_DETAILS_SUBMITTED',
      'BANK_VERIFICATION_PENDING',
      'PAYMENT_REQUEST_PREPARED',
      'PAYMENT_REQUEST_SUBMITTED',
      'PROCESSING',
      'SUCCESSFUL',
      'FAILED',
      'RECONCILIATION_PENDING',
    ])
    .optional(),
  failureReason: z.string().optional(),
});

const statusSequence = [
  'INITIATED',
  'BANK_DETAILS_SUBMITTED',
  'BANK_VERIFICATION_PENDING',
  'PAYMENT_REQUEST_PREPARED',
  'PAYMENT_REQUEST_SUBMITTED',
  'PROCESSING',
  'SUCCESSFUL',
];

/**
 * GET /api/payments
 * Role-filtered payment records
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { status, schemeId, academicYear = '2024-25', page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const whereClause: any = {};

    if (academicYear) whereClause.academicYear = academicYear as string;
    if (schemeId) whereClause.schemeId = schemeId as string;
    if (status) whereClause.paymentStatus = status as string;

    if (user.role === 'STUDENT') {
      if (!user.studentProfileId) {
        return next(new AppError('Student profile not found', 404));
      }
      whereClause.studentProfileId = user.studentProfileId;
    } else if (user.role === 'PRINCIPAL' || user.role === 'TEACHER') {
      if (user.schoolId) {
        whereClause.studentProfile = { schoolId: user.schoolId };
      }
    } else if (user.role === 'DISTRICT_OFFICER') {
      if (user.districtId) {
        whereClause.studentProfile = { districtId: user.districtId };
      }
    }

    const [payments, total] = await Promise.all([
      prisma.paymentRecord.findMany({
        where: whereClause,
        include: {
          scheme: { select: { id: true, name: true, schemeId: true, benefitType: true } },
          studentProfile: {
            select: {
              id: true,
              studentId: true,
              currentGrade: true,
              school: { select: { id: true, name: true } },
              district: { select: { id: true, name: true } },
              user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            },
          },
          application: { select: { id: true, applicationRef: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.paymentRecord.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
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
 * GET /api/payments/:id
 * Retrieve single payment record detail
 */
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const payment = await prisma.paymentRecord.findFirst({
      where: {
        OR: [{ id }, { paymentRef: id }],
      },
      include: {
        scheme: true,
        studentProfile: {
          include: {
            user: true,
            school: true,
            district: true,
          },
        },
        application: {
          include: {
            statusHistory: { orderBy: { timestamp: 'desc' } },
          },
        },
      },
    });

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    if (user.role === 'STUDENT' && payment.studentProfile.userId !== user.id) {
      return next(new AppError('Forbidden: Access denied to this payment record', 403));
    }

    if (
      (user.role === 'PRINCIPAL' || user.role === 'TEACHER') &&
      user.schoolId &&
      payment.studentProfile.schoolId !== user.schoolId
    ) {
      return next(new AppError('Forbidden: Access denied outside your school', 403));
    }

    if (
      user.role === 'DISTRICT_OFFICER' &&
      user.districtId &&
      payment.studentProfile.districtId !== user.districtId
    ) {
      return next(new AppError('Forbidden: Access denied outside your district', 403));
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payments/:id/simulate-status
 * Simulate DBT banking transaction progress for demo / testing
 */
router.post(
  '/:id/simulate-status',
  authenticate,
  requireRole('STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { targetStatus, failureReason } = simulateStatusSchema.parse(req.body || {});

      const payment = await prisma.paymentRecord.findFirst({
        where: { OR: [{ id }, { paymentRef: id }] },
        include: {
          studentProfile: { include: { user: true } },
          application: true,
          scheme: true,
        },
      });

      if (!payment) {
        return next(new AppError('Payment record not found', 404));
      }

      // Determine next status
      let nextStatus: any = targetStatus;
      if (!nextStatus) {
        const currentIndex = statusSequence.indexOf(payment.paymentStatus);
        if (currentIndex >= 0 && currentIndex < statusSequence.length - 1) {
          nextStatus = statusSequence[currentIndex + 1];
        } else {
          nextStatus = 'SUCCESSFUL';
        }
      }

      const updateData: any = {
        paymentStatus: nextStatus,
      };

      if (nextStatus === 'SUCCESSFUL') {
        updateData.bankName = payment.bankName || 'State Bank of India';
        updateData.maskedAccountNumber = payment.maskedAccountNumber || 'XXXXXX8912';
        updateData.reconciliationStatus = 'RECONCILED';
      } else if (nextStatus === 'FAILED') {
        updateData.failureReason = failureReason || 'Bank account IFSC/Name mismatch';
      }

      const updatedPayment = await prisma.paymentRecord.update({
        where: { id: payment.id },
        data: updateData,
        include: {
          scheme: true,
          application: true,
          studentProfile: { include: { user: true } },
        },
      });

      // Synchronize application status upon payment completion
      if (nextStatus === 'SUCCESSFUL') {
        await prisma.scholarshipApplication.update({
          where: { id: payment.applicationId },
          data: {
            status: 'PAID',
            statusHistory: {
              create: {
                fromStatus: payment.application.status,
                toStatus: 'PAID',
                changedBy: req.user!.id,
                reason: `DBT Payment disbursed successfully (Ref: ${payment.paymentRef}, Amount: ₹${payment.approvedAmount}) [DEMO SIMULATION]`,
              },
            },
          },
        });

        await createNotification({
          userId: payment.studentProfile.userId,
          title: 'Direct Benefit Transfer (DBT) Successful',
          message: `Scholarship amount of ₹${payment.approvedAmount} for ${payment.scheme.name} has been successfully disbursed to your bank account.`,
          type: 'SUCCESS',
          relatedEntityType: 'PaymentRecord',
          relatedEntityId: payment.id,
        });
      } else if (nextStatus === 'FAILED') {
        await createNotification({
          userId: payment.studentProfile.userId,
          title: 'DBT Payment Transfer Failed',
          message: `Scholarship payment of ₹${payment.approvedAmount} failed: ${failureReason || 'Account issue'}. Please update your bank details.`,
          type: 'WARNING',
          relatedEntityType: 'PaymentRecord',
          relatedEntityId: payment.id,
        });
      }

      await createAuditLog({
        userId: req.user!.id,
        action: 'SIMULATE_PAYMENT_STATUS',
        entityType: 'PaymentRecord',
        entityId: payment.id,
        details: {
          badge: 'DEMO',
          paymentRef: payment.paymentRef,
          previousStatus: payment.paymentStatus,
          simulatedStatus: nextStatus,
        },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Payment status advanced to ${nextStatus} (Demo mode simulated)`,
        demoBadge: true,
        data: updatedPayment,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as paymentRouter };
