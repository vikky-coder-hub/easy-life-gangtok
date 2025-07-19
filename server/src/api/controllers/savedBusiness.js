import { SavedBusinessService } from '../services/savedBusiness.js';

export const savedBusinessController = {
  async getMySavedBusinesses(req, res) {
    try {
      const userId = req.user.userId;
      const { category, search, page = 1, limit = 20 } = req.query;

      const result = await SavedBusinessService.getSavedBusinesses(userId, {
        category,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Saved businesses retrieved successfully'
      });
    } catch (error) {
      console.error('Get saved businesses error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve saved businesses'
      });
    }
  },

  async saveBusiness(req, res) {
    try {
      const userId = req.user.userId;
      const { businessId } = req.params;
      const { notes, tags } = req.body;

      const savedBusiness = await SavedBusinessService.saveBusiness(userId, businessId, {
        notes,
        tags
      });

      res.status(201).json({
        success: true,
        data: savedBusiness,
        message: 'Business saved successfully'
      });
    } catch (error) {
      console.error('Save business error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to save business'
      });
    }
  },

  async unsaveBusiness(req, res) {
    try {
      const userId = req.user.userId;
      const { businessId } = req.params;

      await SavedBusinessService.unsaveBusiness(userId, businessId);

      res.status(200).json({
        success: true,
        message: 'Business removed from saved list'
      });
    } catch (error) {
      console.error('Unsave business error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove business from saved list'
      });
    }
  },

  async checkIfBusinessSaved(req, res) {
    try {
      const userId = req.user.userId;
      const { businessId } = req.params;

      const isSaved = await SavedBusinessService.checkIfBusinessSaved(userId, businessId);

      res.status(200).json({
        success: true,
        data: { isSaved },
        message: 'Business save status checked'
      });
    } catch (error) {
      console.error('Check business saved error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check business save status'
      });
    }
  }
};