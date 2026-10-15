import prisma from '../lib/prisma';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string; // 'INFO' | 'SUCCESS' | 'WARNING' | 'ACTION_REQUIRED'
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        relatedEntityType: params.relatedEntityType || null,
        relatedEntityId: params.relatedEntityId || null,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}
