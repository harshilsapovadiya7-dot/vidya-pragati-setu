import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

/**
 * GET /api/audit
 * State admin audit trail log retrieval with filtering
 */
router.get(
  '/',
  authenticate,
  requireRole('STATE_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        entityType,
        action,
        userId,
        startDate,
        endDate,
        page = '1',
        limit = '50',
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const take = Math.min(200, Math.max(1, parseInt(limit as string, 10) || 50));
      const skip = (pageNum - 1) * take;

      const whereClause: any = {};

      if (entityType) {
        whereClause.entityType = entityType as string;
      }

      if (action) {
        whereClause.action = action as string;
      }

      if (userId) {
        whereClause.userId = userId as string;
      }

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) {
          whereClause.timestamp.gte = new Date(startDate as string);
        }
        if (endDate) {
          whereClause.timestamp.lte = new Date(endDate as string);
        }
      }

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take,
        }),
        prisma.auditLog.count({ where: whereClause }),
      ]);

      const formattedLogs = logs.map((log) => {
        let parsedDetails = log.details;
        try {
          if (log.details) {
            parsedDetails = JSON.parse(log.details);
          }
        } catch {
          // Keep raw string
        }
        return {
          ...log,
          details: parsedDetails,
        };
      });

      res.status(200).json({
        success: true,
        data: formattedLogs,
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
  }
);

export { router as auditRouter };
