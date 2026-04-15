import { Response } from 'express';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import {
  parsePaginationParams,
  createPaginatedResponse,
  PaginatedResponse,
} from '../../utils/pagination';
import { emitNotification } from '../../utils/socket';

// @desc    Get user notifications (paginated)
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  const { page, limit, sortBy, sortOrder } = parsePaginationParams(req.query);

  const where: any = { userId: req.user!.id };

  // Filter by read status if provided
  if (req.query.isRead !== undefined) {
    where.isRead = req.query.isRead === 'true';
  }

  // Filter by type if provided
  if (req.query.type) {
    where.type = req.query.type;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.notification.count({ where }),
  ]);

  const response: PaginatedResponse<any> = createPaginatedResponse(
    notifications,
    total,
    page,
    limit
  );

  res.status(200).json(response);
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  res.status(200).json({
    message: 'Notification marked as read',
    notification: updatedNotification,
  });
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: req.user!.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  // Emit socket event
  const io = req.app.get('io');
  emitNotification(io, req.user!.id, 'notifications_cleared', {
    message: 'All notifications marked as read',
    count: result.count,
  });

  res.status(200).json({
    message: 'All notifications marked as read',
    count: result.count,
  });
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId: req.user!.id,
    },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  await prisma.notification.delete({ where: { id } });

  res.status(200).json({
    message: 'Notification deleted successfully',
  });
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  const count = await prisma.notification.count({
    where: {
      userId: req.user!.id,
      isRead: false,
    },
  });

  // Get count by type
  const byType = await prisma.notification.groupBy({
    by: ['type'],
    _count: true,
    where: {
      userId: req.user!.id,
      isRead: false,
    },
  });

  res.status(200).json({
    unreadCount: count,
    byType,
  });
};
