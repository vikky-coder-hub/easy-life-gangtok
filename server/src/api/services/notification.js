import { Notification } from '../models/index.js';

export const NotificationService = {
  async getAll(user, { page, limit }) {
    const query = user.userType === 'admin' ? {} : { userId: user.userId };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('relatedId');
    const total = await Notification.countDocuments(query);
    return { notifications, total, page, limit };
  },

  async getUnread(user) {
    const query = user.userType === 'admin' 
      ? { isRead: false } 
      : { userId: user.userId, isRead: false };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('relatedId');
    return notifications;
  },

  async send(notificationData, user) {
    const notification = new Notification({
      ...notificationData,
      createdAt: new Date(),
    });
    await notification.save();
    await notification.populate('userId', 'name email');
    return notification;
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

  async markAllAsRead(user) {
    const query = user.userType === 'admin' 
      ? { isRead: false } 
      : { userId: user.userId, isRead: false };
    await Notification.updateMany(query, { isRead: true });
    return { message: 'All notifications marked as read' };
  },

  async delete(id, user) {
    const notification = await Notification.findById(id);
    if (!notification) throw new Error('Notification not found');
    if (notification.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new Error('Unauthorized');
    }
    await Notification.findByIdAndDelete(id);
    return { message: 'Notification deleted successfully' };
  },

  async getStats(user) {
    const query = user.userType === 'admin' ? {} : { userId: user.userId };
    const total = await Notification.countDocuments(query);
    const unread = await Notification.countDocuments({ ...query, isRead: false });
    const urgent = await Notification.countDocuments({ ...query, type: 'booking', isRead: false });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Notification.countDocuments({ 
      ...query, 
      createdAt: { $gte: today } 
    });
    
    return { total, unread, urgent, today: todayCount };
  },
};