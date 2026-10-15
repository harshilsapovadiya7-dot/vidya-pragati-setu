import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        firstName: string;
        lastName: string;
        studentProfileId?: string;
        schoolId?: string;
        districtId?: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'vps-dev-jwt-secret-change-in-production-2024';

/**
 * Authenticate incoming request using Cookie or Authorization header
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.vps_token) {
      token = req.cookies.vps_token;
    }
    // 2. Check Authorization Bearer header
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Authentication required. Please log in to proceed.', 401)
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
      return next(new AppError('Invalid authentication token.', 401));
    }

    // Find user in database with associated student profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: {
          select: {
            id: true,
            schoolId: true,
            districtId: true,
          },
        },
      },
    });

    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    if (!user.isActive) {
      return next(
        new AppError('This user account has been deactivated.', 403)
      );
    }

    // Determine associated school and district for staff roles
    let assignedSchoolId: string | undefined = user.studentProfile?.schoolId;
    let assignedDistrictId: string | undefined = user.studentProfile?.districtId;

    if (user.role === 'PRINCIPAL' || user.role === 'TEACHER') {
      const school = await prisma.school.findFirst({
        where: {
          OR: [
            { contactEmail: user.email },
            { principalName: `${user.firstName} ${user.lastName}` },
          ],
        },
      });
      if (school) {
        assignedSchoolId = school.id;
        assignedDistrictId = school.districtId;
      }
    } else if (user.role === 'DISTRICT_OFFICER') {
      const district = await prisma.district.findFirst({
        where: {
          name: { contains: user.lastName },
        },
      });
      if (district) {
        assignedDistrictId = district.id;
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      studentProfileId: user.studentProfile?.id,
      schoolId: assignedSchoolId,
      districtId: assignedDistrictId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Restrict access to specified roles
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Requires one of [${roles.join(', ')}] permissions.`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Ensure TEACHER / PRINCIPAL only access resources belonging to their school
 */
export const requireSchoolAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    // STATE_ADMIN has unrestricted access
    if (req.user.role === 'STATE_ADMIN') {
      return next();
    }

    if (req.user.role === 'TEACHER' || req.user.role === 'PRINCIPAL') {
      let targetSchoolId: string | undefined =
        req.params.schoolId || req.query.schoolId as string || req.body.schoolId;

      // If accessing a specific student profile
      if (!targetSchoolId && req.params.id) {
        const student = await prisma.studentProfile.findUnique({
          where: { id: req.params.id },
          select: { schoolId: true },
        });
        if (student) {
          targetSchoolId = student.schoolId;
        } else {
          // Could be application ID
          const app = await prisma.scholarshipApplication.findUnique({
            where: { id: req.params.id },
            include: { studentProfile: { select: { schoolId: true } } },
          });
          if (app) {
            targetSchoolId = app.studentProfile.schoolId;
          } else {
            // Could be asset ID
            const asset = await prisma.assetAllocation.findUnique({
              where: { id: req.params.id },
              select: { schoolId: true },
            });
            if (asset) {
              targetSchoolId = asset.schoolId;
            }
          }
        }
      }

      // If user has an assigned school and target school was identified
      if (req.user.schoolId && targetSchoolId && req.user.schoolId !== targetSchoolId) {
        return next(
          new AppError('Forbidden: Access denied to resources from another school.', 403)
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Ensure DISTRICT_OFFICER only accesses resources belonging to their district
 */
export const requireDistrictAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    // STATE_ADMIN has unrestricted access
    if (req.user.role === 'STATE_ADMIN') {
      return next();
    }

    if (req.user.role === 'DISTRICT_OFFICER') {
      let targetDistrictId: string | undefined =
        req.params.districtId || req.query.districtId as string || req.body.districtId;

      if (!targetDistrictId && req.params.id) {
        const student = await prisma.studentProfile.findUnique({
          where: { id: req.params.id },
          select: { districtId: true },
        });
        if (student) {
          targetDistrictId = student.districtId;
        } else {
          const app = await prisma.scholarshipApplication.findUnique({
            where: { id: req.params.id },
            include: { studentProfile: { select: { districtId: true } } },
          });
          if (app) {
            targetDistrictId = app.studentProfile.districtId;
          } else {
            const asset = await prisma.assetAllocation.findUnique({
              where: { id: req.params.id },
              select: { districtId: true },
            });
            if (asset) {
              targetDistrictId = asset.districtId;
            }
          }
        }
      }

      if (req.user.districtId && targetDistrictId && req.user.districtId !== targetDistrictId) {
        return next(
          new AppError('Forbidden: Access denied to resources from another district.', 403)
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
