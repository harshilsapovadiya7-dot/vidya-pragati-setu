import prisma from '../lib/prisma';

export interface CreateAuditLogParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}): Promise<void> {
  try {
    const formattedDetails =
      params.details !== undefined && params.details !== null
        ? typeof params.details === 'string'
          ? params.details
          : JSON.stringify(params.details)
        : null;

    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        details: formattedDetails,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Avoid failing main transaction/request if audit logging encounters an issue
    console.error('Failed to create audit log entry:', error);
  }
}
