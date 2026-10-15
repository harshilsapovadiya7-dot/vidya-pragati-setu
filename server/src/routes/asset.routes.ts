import { Router, Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole, requireSchoolAccess } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { generateAssetId } from '../utils/generateId';
import { createNotification } from '../services/notification.service';
import { createAuditLog } from '../services/audit.service';

const router = Router();

const createAssetSchema = z.object({
  schemeId: z.string().min(1),
  studentProfileId: z.string().min(1),
  schoolId: z.string().optional(),
  districtId: z.string().optional(),
  academicYear: z.string().default('2024-25'),
  assetPrefix: z.string().default('BIKE'),
});

const dispatchSchema = z.object({
  deliveryOperator: z.string().min(1, 'Delivery operator name is required'),
  notes: z.string().optional(),
});

const verifyDeliverySchema = z.object({
  verificationMethod: z.enum(['QR_CODE', 'OTP', 'MANUAL']),
  verificationCode: z.string().optional(),
  guardianName: z.string().optional(),
  remarks: z.string().optional(),
});

const exceptionSchema = z.object({
  reason: z.string().min(5, 'Exception reason must be at least 5 characters long'),
});

/**
 * GET /api/assets
 * Retrieve list of asset allocations with filtering
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const {
      status,
      schoolId,
      districtId,
      schemeId,
      studentProfileId,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
    const skip = (pageNum - 1) * take;

    const whereClause: any = {};

    if (user.role === 'STUDENT') {
      if (!user.studentProfileId) {
        return next(new AppError('Student profile not found', 404));
      }
      whereClause.studentProfileId = user.studentProfileId;
    } else if (user.role === 'TEACHER' || user.role === 'PRINCIPAL') {
      const targetSchool = user.schoolId || (schoolId as string);
      if (targetSchool) {
        whereClause.schoolId = targetSchool;
      }
    } else if (user.role === 'DISTRICT_OFFICER') {
      const targetDistrict = user.districtId || (districtId as string);
      if (targetDistrict) {
        whereClause.districtId = targetDistrict;
      }
    } else {
      if (schoolId) whereClause.schoolId = schoolId as string;
      if (districtId) whereClause.districtId = districtId as string;
    }

    if (status) whereClause.status = status as string;
    if (schemeId) whereClause.schemeId = schemeId as string;
    if (studentProfileId) whereClause.studentProfileId = studentProfileId as string;

    const [assets, total] = await Promise.all([
      prisma.assetAllocation.findMany({
        where: whereClause,
        include: {
          scheme: { select: { id: true, name: true, schemeId: true } },
          studentProfile: {
            select: {
              id: true,
              studentId: true,
              currentGrade: true,
              user: { select: { firstName: true, lastName: true, phone: true } },
            },
          },
          school: { select: { id: true, name: true, udiseCode: true } },
          district: { select: { id: true, name: true, code: true } },
          verification: true,
        },
        orderBy: { allocationDate: 'desc' },
        skip,
        take,
      }),
      prisma.assetAllocation.count({ where: whereClause }),
    ]);

    res.status(200).json({
      success: true,
      data: assets,
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
 * GET /api/assets/:id
 * Retrieve asset allocation details with tracking events
 */
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const asset = await prisma.assetAllocation.findFirst({
      where: {
        OR: [{ id }, { assetId: id }],
      },
      include: {
        scheme: true,
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, phone: true, email: true } },
            school: true,
            district: true,
          },
        },
        school: true,
        district: true,
        trackingEvents: {
          orderBy: { timestamp: 'desc' },
        },
        verification: true,
      },
    });

    if (!asset) {
      return next(new AppError('Asset allocation not found', 404));
    }

    if (user.role === 'STUDENT' && asset.studentProfile.userId !== user.id) {
      return next(new AppError('Forbidden: Access denied to this asset', 403));
    }

    if (
      (user.role === 'TEACHER' || user.role === 'PRINCIPAL') &&
      user.schoolId &&
      asset.schoolId !== user.schoolId
    ) {
      return next(new AppError('Forbidden: Access denied outside your school', 403));
    }

    if (
      user.role === 'DISTRICT_OFFICER' &&
      user.districtId &&
      asset.districtId !== user.districtId
    ) {
      return next(new AppError('Forbidden: Access denied outside your district', 403));
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/assets
 * Create asset allocation
 */
router.post(
  '/',
  authenticate,
  requireRole('STATE_ADMIN', 'DISTRICT_OFFICER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        schemeId,
        studentProfileId,
        schoolId,
        districtId,
        academicYear = '2024-25',
        assetPrefix = 'BIKE',
      } = createAssetSchema.parse(req.body);

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentProfileId },
      });

      if (!student) {
        return next(new AppError('Student profile not found', 404));
      }

      const assignedSchoolId = schoolId || student.schoolId;
      const assignedDistrictId = districtId || student.districtId;

      const assetId = await generateAssetId(assetPrefix, '2024');

      const qrPayload = JSON.stringify({
        assetId,
        schemeId,
        studentProfileId: student.id,
        schoolId: assignedSchoolId,
        system: 'VPS',
      });

      const asset = await prisma.assetAllocation.create({
        data: {
          assetId,
          schemeId,
          academicYear,
          studentProfileId: student.id,
          schoolId: assignedSchoolId,
          districtId: assignedDistrictId,
          status: 'ALLOCATED',
          allocationDate: new Date(),
          qrCodeData: qrPayload,
          trackingEvents: {
            create: {
              eventType: 'ALLOCATED',
              description: `Asset ${assetId} allocated to beneficiary.`,
              performedBy: req.user!.id,
            },
          },
        },
        include: {
          scheme: true,
          studentProfile: {
            include: { user: true },
          },
          school: true,
          district: true,
          trackingEvents: true,
        },
      });

      await createNotification({
        userId: student.userId,
        title: 'Asset Allocated',
        message: `A material benefit (${asset.assetId}) has been allocated under ${asset.scheme.name}.`,
        type: 'SUCCESS',
        relatedEntityType: 'AssetAllocation',
        relatedEntityId: asset.id,
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'CREATE_ASSET_ALLOCATION',
        entityType: 'AssetAllocation',
        entityId: asset.id,
        details: { assetId: asset.assetId, studentId: student.studentId },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Asset allocated successfully',
        data: asset,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/assets/:id/dispatch
 * Record asset dispatch from warehouse/central hub
 */
router.post(
  '/:id/dispatch',
  authenticate,
  requireRole('STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { deliveryOperator, notes } = dispatchSchema.parse(req.body);

      const asset = await prisma.assetAllocation.findFirst({
        where: { OR: [{ id }, { assetId: id }] },
      });

      if (!asset) {
        return next(new AppError('Asset allocation not found', 404));
      }

      const updated = await prisma.assetAllocation.update({
        where: { id: asset.id },
        data: {
          status: 'DISPATCHED',
          dispatchDate: new Date(),
          deliveryOperator,
          trackingEvents: {
            create: {
              eventType: 'DISPATCHED',
              description: `Asset dispatched via ${deliveryOperator}. ${notes || ''}`.trim(),
              performedBy: req.user!.id,
              metadata: JSON.stringify({ deliveryOperator, notes }),
            },
          },
        },
        include: {
          trackingEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'DISPATCH_ASSET',
        entityType: 'AssetAllocation',
        entityId: asset.id,
        details: { assetId: asset.assetId, deliveryOperator },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Asset dispatched successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/assets/:id/receive
 * School records receipt of asset shipment
 */
router.post(
  '/:id/receive',
  authenticate,
  requireRole('PRINCIPAL', 'TEACHER'),
  requireSchoolAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const asset = await prisma.assetAllocation.findFirst({
        where: { OR: [{ id }, { assetId: id }] },
      });

      if (!asset) {
        return next(new AppError('Asset allocation not found', 404));
      }

      if (req.user!.schoolId && asset.schoolId !== req.user!.schoolId) {
        return next(new AppError('Forbidden: Access denied outside your school', 403));
      }

      const updated = await prisma.assetAllocation.update({
        where: { id: asset.id },
        data: {
          status: 'RECEIVED_BY_SCHOOL',
          schoolReceiptDate: new Date(),
          trackingEvents: {
            create: {
              eventType: 'RECEIVED_BY_SCHOOL',
              description: 'Asset received at school and inspected by staff.',
              performedBy: req.user!.id,
            },
          },
        },
        include: {
          trackingEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'RECEIVE_ASSET_AT_SCHOOL',
        entityType: 'AssetAllocation',
        entityId: asset.id,
        details: { assetId: asset.assetId },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Asset received at school successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/assets/:id/assign
 * School prepares asset for beneficiary handover
 */
router.post(
  '/:id/assign',
  authenticate,
  requireRole('PRINCIPAL', 'TEACHER'),
  requireSchoolAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const asset = await prisma.assetAllocation.findFirst({
        where: { OR: [{ id }, { assetId: id }] },
      });

      if (!asset) {
        return next(new AppError('Asset allocation not found', 404));
      }

      if (req.user!.schoolId && asset.schoolId !== req.user!.schoolId) {
        return next(new AppError('Forbidden: Access denied outside your school', 403));
      }

      const updated = await prisma.assetAllocation.update({
        where: { id: asset.id },
        data: {
          status: 'ASSIGNED_TO_BENEFICIARY',
          trackingEvents: {
            create: {
              eventType: 'ASSIGNED_TO_BENEFICIARY',
              description: 'Asset staged and assigned for handover to beneficiary.',
              performedBy: req.user!.id,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: 'Asset assigned to beneficiary',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/assets/:id/verify-delivery
 * Handover verification and confirmation of delivery
 */
router.post(
  '/:id/verify-delivery',
  authenticate,
  requireRole('PRINCIPAL', 'TEACHER'),
  requireSchoolAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { verificationMethod, verificationCode, guardianName, remarks } =
        verifyDeliverySchema.parse(req.body);

      const asset = await prisma.assetAllocation.findFirst({
        where: { OR: [{ id }, { assetId: id }] },
        include: {
          verification: true,
          studentProfile: { include: { user: true } },
        },
      });

      if (!asset) {
        return next(new AppError('Asset allocation not found', 404));
      }

      if (req.user!.schoolId && asset.schoolId !== req.user!.schoolId) {
        return next(new AppError('Forbidden: Access denied outside your school', 403));
      }

      if (asset.status === 'DELIVERY_CONFIRMED' || asset.verification?.isVerified) {
        return next(
          new AppError(
            `Asset ${asset.assetId} has already been verified and confirmed as delivered.`,
            400
          )
        );
      }

      const deliveryDate = new Date();

      // Upsert DeliveryVerification record
      const verification = await prisma.deliveryVerification.upsert({
        where: { assetAllocationId: asset.id },
        create: {
          assetAllocationId: asset.id,
          verificationMethod,
          verificationCode,
          isVerified: true,
          verifiedAt: deliveryDate,
          verifiedBy: req.user!.id,
          studentConfirmed: true,
          guardianName,
          remarks,
        },
        update: {
          verificationMethod,
          verificationCode,
          isVerified: true,
          verifiedAt: deliveryDate,
          verifiedBy: req.user!.id,
          studentConfirmed: true,
          guardianName,
          remarks,
        },
      });

      const updatedAsset = await prisma.assetAllocation.update({
        where: { id: asset.id },
        data: {
          status: 'DELIVERY_CONFIRMED',
          deliveryConfirmationDate: deliveryDate,
          deliveryVerificationMethod: verificationMethod,
          trackingEvents: {
            create: {
              eventType: 'DELIVERY_CONFIRMED',
              description: `Handover verified and completed via ${verificationMethod}. ${remarks || ''}`.trim(),
              performedBy: req.user!.id,
              metadata: JSON.stringify({ verificationMethod, guardianName }),
            },
          },
        },
        include: {
          verification: true,
          trackingEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      await createNotification({
        userId: asset.studentProfile.userId,
        title: 'Asset Delivery Confirmed',
        message: `Your material benefit (${asset.assetId}) delivery has been verified and confirmed.`,
        type: 'SUCCESS',
        relatedEntityType: 'AssetAllocation',
        relatedEntityId: asset.id,
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'VERIFY_ASSET_DELIVERY',
        entityType: 'AssetAllocation',
        entityId: asset.id,
        details: { assetId: asset.assetId, verificationMethod, guardianName },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Asset delivery verified and confirmed successfully',
        data: updatedAsset,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/assets/:id/exception
 * Record delivery exception or damage
 */
router.post(
  '/:id/exception',
  authenticate,
  requireRole('PRINCIPAL', 'TEACHER', 'DISTRICT_OFFICER'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { reason } = exceptionSchema.parse(req.body);

      const asset = await prisma.assetAllocation.findFirst({
        where: { OR: [{ id }, { assetId: id }] },
      });

      if (!asset) {
        return next(new AppError('Asset allocation not found', 404));
      }

      const updated = await prisma.assetAllocation.update({
        where: { id: asset.id },
        data: {
          status: 'DELIVERY_EXCEPTION',
          exceptionReason: reason,
          trackingEvents: {
            create: {
              eventType: 'DELIVERY_EXCEPTION',
              description: `Exception flagged: ${reason}`,
              performedBy: req.user!.id,
              metadata: JSON.stringify({ reason }),
            },
          },
        },
        include: {
          trackingEvents: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'ASSET_DELIVERY_EXCEPTION',
        entityType: 'AssetAllocation',
        entityId: asset.id,
        details: { assetId: asset.assetId, reason },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Delivery exception logged',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/assets/:id/history
 * Retrieve tracking timeline for an asset
 */
router.get('/:id/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const asset = await prisma.assetAllocation.findFirst({
      where: { OR: [{ id }, { assetId: id }] },
      select: { id: true, assetId: true },
    });

    if (!asset) {
      return next(new AppError('Asset allocation not found', 404));
    }

    const events = await prisma.assetTrackingEvent.findMany({
      where: { assetAllocationId: asset.id },
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/assets/:id/qr
 * Generate QR code data URL for verification
 */
router.get('/:id/qr', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const asset = await prisma.assetAllocation.findFirst({
      where: { OR: [{ id }, { assetId: id }] },
    });

    if (!asset) {
      return next(new AppError('Asset allocation not found', 404));
    }

    const payload = asset.qrCodeData || asset.assetId;
    const qrCodeUrl = await QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        assetId: asset.assetId,
        qrCodeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as assetRouter };
