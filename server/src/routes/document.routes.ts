import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { createNotification } from '../services/notification.service';
import { createAuditLog } from '../services/audit.service';

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}-${sanitizedName}${ext}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Invalid file type. Only JPEG, PNG images and PDF documents are allowed.',
          400
        )
      );
    }
  },
});

const verifyDocSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

/**
 * GET /api/documents
 * List current user's documents (student) or review queue (teacher/principal)
 */
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const { status, studentProfileId, documentCategory } = req.query;

    const whereClause: any = {};

    if (user.role === 'STUDENT') {
      if (!user.studentProfileId) {
        return next(new AppError('Student profile not found', 404));
      }
      whereClause.studentProfileId = user.studentProfileId;
    } else if (user.role === 'TEACHER' || user.role === 'PRINCIPAL') {
      // Find students in user's school
      if (user.schoolId) {
        whereClause.studentProfile = { schoolId: user.schoolId };
      }
      if (studentProfileId) {
        whereClause.studentProfileId = studentProfileId as string;
      }
    } else if (user.role === 'DISTRICT_OFFICER') {
      if (user.districtId) {
        whereClause.studentProfile = { districtId: user.districtId };
      }
      if (studentProfileId) {
        whereClause.studentProfileId = studentProfileId as string;
      }
    } else if (studentProfileId) {
      whereClause.studentProfileId = studentProfileId as string;
    }

    if (status) {
      whereClause.verificationStatus = status as string;
    }

    if (documentCategory) {
      whereClause.documentCategory = documentCategory as string;
    }

    const documents = await prisma.studentDocument.findMany({
      where: whereClause,
      include: {
        studentProfile: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            school: { select: { id: true, name: true } },
            district: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents
 * Student upload document
 */
router.post(
  '/',
  authenticate,
  requireRole('STUDENT'),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return next(new AppError('No file was uploaded.', 400));
      }

      const { documentCategory } = req.body;
      const validCategories = [
        'IDENTITY',
        'INCOME_CERTIFICATE',
        'CASTE_CERTIFICATE',
        'MARKSHEET',
        'ENROLLMENT_CERTIFICATE',
        'BANK_PROOF',
        'PHOTOGRAPH',
        'OTHER',
      ];

      if (!documentCategory || !validCategories.includes(documentCategory)) {
        // Clean up file if uploaded
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(
          new AppError(
            `Invalid documentCategory. Must be one of: ${validCategories.join(', ')}`,
            400
          )
        );
      }

      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id },
      });

      if (!student) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return next(new AppError('Student profile not found', 404));
      }

      const document = await prisma.studentDocument.create({
        data: {
          studentProfileId: student.id,
          documentCategory,
          fileName: req.file.originalname,
          filePath: req.file.path,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          verificationStatus: 'PENDING',
        },
      });

      // Update student profile status
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { documentVerificationStatus: 'PENDING' },
      });

      await createAuditLog({
        userId: req.user!.id,
        action: 'UPLOAD_DOCUMENT',
        entityType: 'StudentDocument',
        entityId: document.id,
        details: { category: documentCategory, fileName: req.file.originalname },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document,
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch {
          // ignore
        }
      }
      next(error);
    }
  }
);

/**
 * GET /api/documents/:id
 * Get document metadata
 */
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const document = await prisma.studentDocument.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            school: true,
            district: true,
          },
        },
      },
    });

    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    const user = req.user!;
    if (user.role === 'STUDENT' && document.studentProfile.userId !== user.id) {
      return next(new AppError('Forbidden: Access denied to this document', 403));
    }

    if (
      (user.role === 'TEACHER' || user.role === 'PRINCIPAL') &&
      user.schoolId &&
      user.schoolId !== document.studentProfile.schoolId
    ) {
      return next(new AppError('Forbidden: Access denied outside your school', 403));
    }

    if (
      user.role === 'DISTRICT_OFFICER' &&
      user.districtId &&
      user.districtId !== document.studentProfile.districtId
    ) {
      return next(new AppError('Forbidden: Access denied outside your district', 403));
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/:id/file
 * Serve physical document file
 */
router.get('/:id/file', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const document = await prisma.studentDocument.findUnique({
      where: { id },
      include: {
        studentProfile: true,
      },
    });

    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    const user = req.user!;
    if (user.role === 'STUDENT' && document.studentProfile.userId !== user.id) {
      return next(new AppError('Forbidden: Access denied to this file', 403));
    }

    if (
      (user.role === 'TEACHER' || user.role === 'PRINCIPAL') &&
      user.schoolId &&
      user.schoolId !== document.studentProfile.schoolId
    ) {
      return next(new AppError('Forbidden: Access denied outside your school', 403));
    }

    if (
      user.role === 'DISTRICT_OFFICER' &&
      user.districtId &&
      user.districtId !== document.studentProfile.districtId
    ) {
      return next(new AppError('Forbidden: Access denied outside your district', 403));
    }

    const filePath = path.resolve(document.filePath);
    if (!fs.existsSync(filePath)) {
      return next(new AppError('The requested file could not be found on storage.', 404));
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(document.fileName)}"`
    );
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents/:id/verify
 * Teacher/Principal verification of student document
 */
router.post(
  '/:id/verify',
  authenticate,
  requireRole('TEACHER', 'PRINCIPAL'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = verifyDocSchema.parse(req.body);

      if (status === 'REJECTED' && !rejectionReason) {
        return next(
          new AppError('Please provide a reason for rejecting this document.', 400)
        );
      }

      const document = await prisma.studentDocument.findUnique({
        where: { id },
        include: {
          studentProfile: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!document) {
        return next(new AppError('Document not found', 404));
      }

      if (
        req.user!.schoolId &&
        document.studentProfile.schoolId !== req.user!.schoolId
      ) {
        return next(new AppError('Forbidden: Access denied outside your school', 403));
      }

      const updatedDoc = await prisma.studentDocument.update({
        where: { id },
        data: {
          verificationStatus: status,
          verifiedAt: new Date(),
          verifiedBy: req.user!.id,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
      });

      // Recalculate student document verification status
      const studentAllDocs = await prisma.studentDocument.findMany({
        where: { studentProfileId: document.studentProfileId },
      });

      let overallDocStatus = 'PENDING';
      const allVerified = studentAllDocs.every((d) => d.verificationStatus === 'VERIFIED');
      const anyRejected = studentAllDocs.some((d) => d.verificationStatus === 'REJECTED');

      if (allVerified && studentAllDocs.length > 0) {
        overallDocStatus = 'VERIFIED';
      } else if (anyRejected) {
        overallDocStatus = 'REJECTED';
      }

      await prisma.studentProfile.update({
        where: { id: document.studentProfileId },
        data: { documentVerificationStatus: overallDocStatus },
      });

      // Send notification to student
      await createNotification({
        userId: document.studentProfile.userId,
        title: `Document ${status === 'VERIFIED' ? 'Verified' : 'Rejected'}`,
        message:
          status === 'VERIFIED'
            ? `Your document (${document.documentCategory}) has been successfully verified.`
            : `Your document (${document.documentCategory}) was rejected. Reason: ${rejectionReason}`,
        type: status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
        relatedEntityType: 'StudentDocument',
        relatedEntityId: document.id,
      });

      await createAuditLog({
        userId: req.user!.id,
        action: `DOCUMENT_${status}`,
        entityType: 'StudentDocument',
        entityId: document.id,
        details: { status, rejectionReason },
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Document status updated to ${status}`,
        data: updatedDoc,
      });
    } catch (error) {
      next(error);
    }
  }
);

export { router as documentRouter };
