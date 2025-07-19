import { activityService } from '../services/activity.js';

export const activityController = {
  async getMyActivity(req, res) {
    try {
      const userId = req.user.userId;
      const { type, limit = 20, page = 1 } = req.query;
      
      const result = await activityService.getCustomerActivity(userId, {
        type,
        limit: parseInt(limit),
        page: parseInt(page)
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Customer activity retrieved successfully'
      });
    } catch (error) {
      console.error('Get customer activity error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve customer activity'
      });
    }
  },

  async getCustomerActivity(req, res) {
    try {
      const { id: customerId } = req.params;
      const { type, limit = 20, page = 1 } = req.query;

      const result = await activityService.getCustomerActivity(customerId, {
        type,
        limit: parseInt(limit),
        page: parseInt(page)
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Customer activity retrieved successfully'
      });
    } catch (error) {
      console.error('Get customer activity error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve customer activity'
      });
    }
  }
};
