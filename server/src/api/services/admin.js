import { User, Business, Booking, Settlement } from '../models/index.js';
import { NotFoundError, UnauthorizedError } from '../middlewares/error.js';
import { Notification } from '../models/index.js';

export const AdminService = {
  async getUserAnalytics({ period }) {
    const now = new Date();
    let startDate;
    switch (period) {
      case 'last7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'last90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'lastyear':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const users = await User.find({ createdAt: { $gte: startDate } });
    const userActivity = [];
    const days = period === 'last7days' ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const date = new Date(now.setDate(now.getDate() - i));
      userActivity.push({
        date: date.toISOString().split('T')[0],
        users: users.filter(u => u.createdAt.toISOString().split('T')[0] === date.toISOString().split('T')[0]).length,
      });
    }

    return { totalUsers: users.length, userActivity };
  },

  async getBusinessAnalytics({ period }) {
    const now = new Date();
    let startDate;
    switch (period) {
      case 'last7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'last90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'lastyear':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const businesses = await Business.find({ createdAt: { $gte: startDate } });
    const businessActivity = [];
    const days = period === 'last7days' ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const date = new Date(now.setDate(now.getDate() - i));
      businessActivity.push({
        date: date.toISOString().split('T')[0],
        businesses: businesses.filter(b => b.createdAt.toISOString().split('T')[0] === date.toISOString().split('T')[0]).length,
      });
    }

    const categories = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { name: '$category.name', count: 1, percentage: { $multiply: [{ $divide: ['$count', await Business.countDocuments()] }, 100] } } },
    ]);

    return { totalBusinesses: businesses.length, businessActivity, categories };
  },

  async approveBusiness(id, user) {
    if (user.userType !== 'admin') throw new UnauthorizedError('Only admins can approve businesses');
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');

    business.status = 'approved';
    business.approvalDate = new Date();
    await business.save();

    await Notification.create({
      userId: business.userId,
      type: 'business',
      message: `Business ${business.name} approved`,
      relatedId: business._id,
    });

    return business;
  },

  async rejectBusiness(id, user) {
    if (user.userType !== 'admin') throw new UnauthorizedError('Only admins can reject businesses');
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');

    business.status = 'rejected';
    await business.save();

    await Notification.create({
      userId: business.userId,
      type: 'business',
      message: `Business ${business.name} rejected`,
      relatedId: business._id,
    });

    return business;
  },

  async getPendingBusinesses({ page = 1, limit = 10 }) {
    const businesses = await Business.find({ status: 'pending' })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .populate('category', 'name');
    const total = await Business.countDocuments({ status: 'pending' });
    return { businesses, total, page, limit };
  },

  async getUnderReviewBusinesses({ page = 1, limit = 10 }) {
    const businesses = await Business.find({ status: 'under_review' })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .populate('category', 'name');
    const total = await Business.countDocuments({ status: 'under_review' });
    return { businesses, total, page, limit };
  },

  async banUser(id, isBanned, user) {
    if (user.userType !== 'admin') throw new UnauthorizedError('Only admins can ban users');
    const targetUser = await User.findById(id);
    if (!targetUser) throw new NotFoundError('User not found');
    targetUser.isBanned = isBanned;
    await targetUser.save();

    await Notification.create({
      userId: id,
      type: 'system',
      message: `Your account has been ${isBanned ? 'banned' : 'unbanned'}`,
      relatedId: id,
    });

    if (isBanned) {
      await Business.updateMany({ userId: id }, { status: 'banned' });
    }
    return targetUser;
  },

  async getSystemStats() {
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalSettlements = await Settlement.countDocuments();
    return {
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalSettlements,
      activeUsers: await User.countDocuments({ isActive: true }),
      bannedUsers: await User.countDocuments({ isBanned: true }),
      pendingBusinesses: await Business.countDocuments({ status: 'pending' }),
      approvedBusinesses: await Business.countDocuments({ status: 'approved' }),
    };
  },
};