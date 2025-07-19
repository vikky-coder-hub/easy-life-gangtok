import { AdminService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';
import { NotFoundError, UnauthorizedError } from '../middlewares/error.js';

export const adminController = {
  async getUserAnalytics(req, res, next) {
    try {
      const analytics = await AdminService.getUserAnalytics(req.query);
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBusinessAnalytics(req, res, next) {
    try {
      const analytics = await AdminService.getBusinessAnalytics(req.query);
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  async approveBusiness(req, res, next) {
    try {
      const business = await AdminService.approveBusiness(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business approved successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async rejectBusiness(req, res, next) {
    try {
      const business = await AdminService.rejectBusiness(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business rejected successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPendingBusinesses(req, res, next) {
    try {
      const businesses = await AdminService.getPendingBusinesses(req.query);
      sendResponse(res, 200, {
        success: true,
        data: businesses,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUnderReviewBusinesses(req, res, next) {
    try {
      const businesses = await AdminService.getUnderReviewBusinesses(req.query);
      sendResponse(res, 200, {
        success: true,
        data: businesses,
      });
    } catch (error) {
      next(error);
    }
  },

  async banUser(req, res, next) {
    try {
      const user = await AdminService.banUser(req.params.id, req.body.isBanned, req.user);
      sendResponse(res, 200, {
        success: true,
        message: `User ${req.body.isBanned ? 'banned' : 'unbanned'} successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSystemStats(req, res, next) {
    try {
      const stats = await AdminService.getSystemStats();
      sendResponse(res, 200, {
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};