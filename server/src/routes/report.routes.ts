import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { convertToCsv } from '../utils/csvExport';

const router = Router();

/**
 * GET /api/reports/summary
 * Role-aware high level KPI dashboard metrics
 */
router.get('/summary', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { schoolId, districtId } = req.query;

    const studentFilter: any = {};
    const assetFilter: any = {};

    if (user.role === 'PRINCIPAL' || user.role === 'TEACHER') {
      const activeSchoolId = user.schoolId || (schoolId as string);
      if (activeSchoolId) {
        studentFilter.schoolId = activeSchoolId;
        assetFilter.schoolId = activeSchoolId;
      }
    } else if (user.role === 'DISTRICT_OFFICER') {
      const activeDistrictId = user.districtId || (districtId as string);
      if (activeDistrictId) {
        studentFilter.districtId = activeDistrictId;
        assetFilter.districtId = activeDistrictId;
      }
    } else if (user.role === 'STATE_ADMIN') {
      if (schoolId) {
        studentFilter.schoolId = schoolId as string;
        assetFilter.schoolId = schoolId as string;
      }
      if (districtId) {
        studentFilter.districtId = districtId as string;
        assetFilter.districtId = districtId as string;
      }
    }

    const [
      totalStudents,
      totalEvaluations,
      totalApplications,
      approvedApplications,
      paidPaymentsAggregate,
      confirmedBicycleDeliveries,
      totalAssetAllocations,
    ] = await Promise.all([
      prisma.studentProfile.count({ where: studentFilter }),
      prisma.eligibilityEvaluation.count({
        where: { studentProfile: studentFilter },
      }),
      prisma.scholarshipApplication.count({
        where: { studentProfile: studentFilter },
      }),
      prisma.scholarshipApplication.count({
        where: {
          studentProfile: studentFilter,
          status: { in: ['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'] },
        },
      }),
      prisma.paymentRecord.aggregate({
        _sum: { approvedAmount: true },
        where: {
          studentProfile: studentFilter,
          paymentStatus: 'SUCCESSFUL',
        },
      }),
      prisma.assetAllocation.count({
        where: {
          ...assetFilter,
          status: 'DELIVERY_CONFIRMED',
        },
      }),
      prisma.assetAllocation.count({
        where: assetFilter,
      }),
    ]);

    const benefitsDisbursed = paidPaymentsAggregate._sum.approvedAmount || 0;

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalEvaluations,
        totalApplications,
        approvedApplications,
        benefitsDisbursed,
        confirmedBicycleDeliveries,
        totalAssetAllocations,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/applications
 * Aggregated application analytics grouped by scheme, status, district, and school
 */
router.get(
  '/applications',
  authenticate,
  requireRole('PRINCIPAL', 'DISTRICT_OFFICER', 'STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { schoolId, districtId, academicYear = '2024-25' } = req.query;

      const whereClause: any = { academicYear: academicYear as string };

      if (user.role === 'PRINCIPAL' || user.role === 'TEACHER') {
        const targetSchool = user.schoolId || (schoolId as string);
        if (targetSchool) whereClause.studentProfile = { schoolId: targetSchool };
      } else if (user.role === 'DISTRICT_OFFICER') {
        const targetDistrict = user.districtId || (districtId as string);
        if (targetDistrict) whereClause.studentProfile = { districtId: targetDistrict };
      } else {
        if (schoolId) whereClause.studentProfile = { schoolId: schoolId as string };
        if (districtId) {
          whereClause.studentProfile = {
            ...(whereClause.studentProfile || {}),
            districtId: districtId as string,
          };
        }
      }

      const applications = await prisma.scholarshipApplication.findMany({
        where: whereClause,
        include: {
          scheme: { select: { id: true, name: true, schemeId: true } },
          studentProfile: {
            select: {
              school: { select: { id: true, name: true } },
              district: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Group by status
      const byStatus: Record<string, number> = {};
      const byScheme: Record<string, { schemeId: string; schemeName: string; total: number; approved: number }> = {};
      const byDistrict: Record<string, { districtId: string; districtName: string; count: number }> = {};
      const bySchool: Record<string, { schoolId: string; schoolName: string; count: number }> = {};

      for (const app of applications) {
        // Status aggregation
        byStatus[app.status] = (byStatus[app.status] || 0) + 1;

        // Scheme aggregation
        if (!byScheme[app.schemeId]) {
          byScheme[app.schemeId] = {
            schemeId: app.scheme.schemeId,
            schemeName: app.scheme.name,
            total: 0,
            approved: 0,
          };
        }
        byScheme[app.schemeId].total += 1;
        if (['APPROVED', 'PAYMENT_PENDING', 'PAYMENT_PROCESSING', 'PAID'].includes(app.status)) {
          byScheme[app.schemeId].approved += 1;
        }

        // District aggregation
        const dist = app.studentProfile.district;
        if (dist) {
          if (!byDistrict[dist.id]) {
            byDistrict[dist.id] = { districtId: dist.id, districtName: dist.name, count: 0 };
          }
          byDistrict[dist.id].count += 1;
        }

        // School aggregation
        const school = app.studentProfile.school;
        if (school) {
          if (!bySchool[school.id]) {
            bySchool[school.id] = { schoolId: school.id, schoolName: school.name, count: 0 };
          }
          bySchool[school.id].count += 1;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          total: applications.length,
          byStatus,
          byScheme: Object.values(byScheme),
          byDistrict: Object.values(byDistrict),
          bySchool: Object.values(bySchool),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/assets
 * Asset distribution lifecycle statistics
 */
router.get('/assets', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { schoolId, districtId } = req.query;

    const whereClause: any = {};
    if (user.role === 'PRINCIPAL' || user.role === 'TEACHER') {
      const activeSchool = user.schoolId || (schoolId as string);
      if (activeSchool) whereClause.schoolId = activeSchool;
    } else if (user.role === 'DISTRICT_OFFICER') {
      const activeDistrict = user.districtId || (districtId as string);
      if (activeDistrict) whereClause.districtId = activeDistrict;
    }

    const assets = await prisma.assetAllocation.findMany({
      where: whereClause,
      include: {
        scheme: { select: { id: true, name: true } },
        district: { select: { id: true, name: true } },
      },
    });

    const byStatus: Record<string, number> = {};
    const byDistrict: Record<string, number> = {};

    for (const asset of assets) {
      byStatus[asset.status] = (byStatus[asset.status] || 0) + 1;
      if (asset.district?.name) {
        byDistrict[asset.district.name] = (byDistrict[asset.district.name] || 0) + 1;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalAllocations: assets.length,
        byStatus,
        byDistrict,
        deliverySuccessRate:
          assets.length > 0
            ? Math.round(((byStatus['DELIVERY_CONFIRMED'] || 0) / assets.length) * 100)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/payments
 * Direct Benefit Transfer financial report
 */
router.get(
  '/payments',
  authenticate,
  requireRole('DISTRICT_OFFICER', 'STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { districtId } = req.query;

      const whereClause: any = {};
      if (user.role === 'DISTRICT_OFFICER') {
        const activeDist = user.districtId || (districtId as string);
        if (activeDist) whereClause.studentProfile = { districtId: activeDist };
      }

      const payments = await prisma.paymentRecord.findMany({
        where: whereClause,
        include: {
          scheme: { select: { id: true, name: true } },
        },
      });

      let totalDisbursedAmount = 0;
      let totalPendingAmount = 0;
      let totalFailedAmount = 0;
      const byStatus: Record<string, number> = {};

      for (const p of payments) {
        byStatus[p.paymentStatus] = (byStatus[p.paymentStatus] || 0) + 1;

        if (p.paymentStatus === 'SUCCESSFUL') {
          totalDisbursedAmount += p.approvedAmount;
        } else if (p.paymentStatus === 'FAILED') {
          totalFailedAmount += p.approvedAmount;
        } else {
          totalPendingAmount += p.approvedAmount;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          totalRecords: payments.length,
          totalDisbursedAmount,
          totalPendingAmount,
          totalFailedAmount,
          byStatus,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/export/csv
 * Export dataset to CSV
 */
router.get(
  '/export/csv',
  authenticate,
  requireRole('PRINCIPAL', 'DISTRICT_OFFICER', 'STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { type = 'applications' } = req.query;

      let exportData: Record<string, any>[] = [];

      if (type === 'applications') {
        const apps = await prisma.scholarshipApplication.findMany({
          include: {
            scheme: true,
            studentProfile: {
              include: { user: true, school: true, district: true },
            },
          },
          take: 2000,
        });

        exportData = apps.map((app) => ({
          'Application Reference': app.applicationRef,
          'Academic Year': app.academicYear,
          'Scheme Name': app.scheme.name,
          'Scheme ID': app.scheme.schemeId,
          Status: app.status,
          'Student ID': app.studentProfile.studentId,
          'Student Name': `${app.studentProfile.user.firstName} ${app.studentProfile.user.lastName}`,
          'Current Grade': app.studentProfile.currentGrade,
          Category: app.studentProfile.category,
          Gender: app.studentProfile.gender || '',
          School: app.studentProfile.school.name,
          District: app.studentProfile.district.name,
          'Submitted Date': app.submittedAt ? app.submittedAt.toISOString() : '',
          'Created Date': app.createdAt.toISOString(),
        }));
      } else if (type === 'assets') {
        const assets = await prisma.assetAllocation.findMany({
          include: {
            scheme: true,
            school: true,
            district: true,
            studentProfile: { include: { user: true } },
            verification: true,
          },
          take: 2000,
        });

        exportData = assets.map((asset) => ({
          'Asset ID': asset.assetId,
          Scheme: asset.scheme.name,
          Status: asset.status,
          'Beneficiary Name': `${asset.studentProfile.user.firstName} ${asset.studentProfile.user.lastName}`,
          'Student ID': asset.studentProfile.studentId,
          School: asset.school.name,
          District: asset.district.name,
          'Allocation Date': asset.allocationDate.toISOString(),
          'Dispatch Date': asset.dispatchDate ? asset.dispatchDate.toISOString() : '',
          'Delivery Date': asset.deliveryConfirmationDate
            ? asset.deliveryConfirmationDate.toISOString()
            : '',
          'Verification Method': asset.deliveryVerificationMethod || '',
          'Guardian Name': asset.verification?.guardianName || '',
        }));
      } else if (type === 'payments') {
        const payments = await prisma.paymentRecord.findMany({
          include: {
            scheme: true,
            application: true,
            studentProfile: { include: { user: true, school: true, district: true } },
          },
          take: 2000,
        });

        exportData = payments.map((p) => ({
          'Payment Reference': p.paymentRef,
          'Application Reference': p.application.applicationRef,
          Scheme: p.scheme.name,
          'Approved Amount': p.approvedAmount,
          'Payment Status': p.paymentStatus,
          'Bank Name': p.bankName || '',
          'Account Number': p.maskedAccountNumber || '',
          'Student Name': `${p.studentProfile.user.firstName} ${p.studentProfile.user.lastName}`,
          School: p.studentProfile.school.name,
          District: p.studentProfile.district.name,
          'Initiated At': p.initiatedAt.toISOString(),
        }));
      } else {
        // Students
        const students = await prisma.studentProfile.findMany({
          include: { user: true, school: true, district: true },
          take: 2000,
        });

        exportData = students.map((s) => ({
          'Student ID': s.studentId,
          Name: `${s.user.firstName} ${s.user.lastName}`,
          Email: s.user.email,
          Grade: s.currentGrade,
          Gender: s.gender || '',
          Category: s.category,
          'Annual Family Income': s.annualFamilyIncome ?? '',
          'Academic Marks %': s.academicMarks ?? '',
          'Attendance %': s.attendancePercentage ?? '',
          School: s.school.name,
          District: s.district.name,
          'Profile Completion %': s.profileCompletionPercentage,
        }));
      }

      const csvContent = convertToCsv(exportData);
      const filename = `vps-export-${type}-${new Date().toISOString().slice(0, 10)}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  }
);

export { router as reportRouter };
