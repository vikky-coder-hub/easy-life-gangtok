import { Notification } from '../models/index.js';

export const NotificationService = {
  async getAll(user, { page, limit }) {
    const query = user.userType === 'admin' ? {} : { userId: user.userId };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Notification.countDocuments(query);
    return { notifications, total, page, limit };
  },

  async markAsRead(id, user) {
    const notification = await Notification.findById(id);
    if (!notification) throw new Error('Notification not found');
    if (notification.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new Error('Unauthorized');
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  },
};