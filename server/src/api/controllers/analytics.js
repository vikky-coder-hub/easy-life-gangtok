import { AnalyticsService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const analyticsController = {
  async getBusinessAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getBusinessAnalytics(req.params.id);
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCustomerAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getCustomerAnalytics(req.params.id);
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPlatformAnalytics(req, res, next) {
    try {
      const analytics = await AnalyticsService.getPlatformAnalytics(req.query.period);
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFinancialReports(req, res, next) {
    try {
      const reports = await AnalyticsService.getFinancialReports(req.query.period);
      sendResponse(res, 200, {
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserActivityReports(req, res, next) {
    try {
      const reports = await AnalyticsService.getUserActivityReports(req.query.period);
      sendResponse(res, 200, {
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCustomerDashboard(req, res, next) {
    try {
      const dashboardData = await AnalyticsService.getCustomerDashboard(req.user.userId);
      sendResponse(res, 200, {
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerDashboard(req, res, next) {
    try {
      const dashboardData = await AnalyticsService.getSellerDashboard(req.user.userId);
      sendResponse(res, 200, {
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAdminDashboard(req, res, next) {
    try {
      const dashboardData = await AnalyticsService.getAdminDashboard();
      sendResponse(res, 200, {
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerFinancialAnalytics(req, res, next) {
    try {
      const { period = 'last30days' } = req.query;
      const analytics = await AnalyticsService.getSellerFinancialAnalytics(req.user.userId, period);
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAdminCustomerAnalytics(req, res, next) {
    try {
      const { period = 'last30days', page = 1, limit = 10 } = req.query;
      const analytics = await AnalyticsService.getAdminCustomerAnalytics(
        period, 
        parseInt(page), 
        parseInt(limit)
      );
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },
};