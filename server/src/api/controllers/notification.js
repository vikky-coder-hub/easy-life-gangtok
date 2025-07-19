import { NotificationService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const notificationController = {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const notifications = await NotificationService.getAll(req.user, { page, limit });
      sendResponse(res, 200, {
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnread(req, res, next) {
    try {
      const notifications = await NotificationService.getUnread(req.user);
      sendResponse(res, 200, {
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  },

  async send(req, res, next) {
    try {
      const notification = await NotificationService.send(req.body, req.user);
      sendResponse(res, 201, {
        success: true,
        message: 'Notification sent successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  },
};