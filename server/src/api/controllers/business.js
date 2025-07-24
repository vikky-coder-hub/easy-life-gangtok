import { BusinessService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const businessController = {
  async submit(req, res, next) {
    try {
      console.log('=== BUSINESS SUBMIT DEBUG ===');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('User from token:', req.user);
      console.log('Files:', req.files);
      
      const business = await BusinessService.create(req.body, req.files, req.user);
      console.log('Created business:', business);
      
      res.status(201).json({
        success: true,
        message: 'Business submitted successfully',
        data: business,
      });
    } catch (error) {
      console.error('Business submission error:', error);
      next(error);
    }
  },

  async getMyBusiness(req, res, next) {
    try {
      const business = await BusinessService.getMyBusiness(req.user);
      sendResponse(res, 200, {
        success: true,
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async updatePhotos(req, res, next) {
    try {
      console.log('=== UPDATE PHOTOS DEBUG ===');
      console.log('Business ID:', req.params.id);
      console.log('Files received:', req.files);
      console.log('User:', req.user);
      
      const business = await BusinessService.updatePhotos(req.params.id, req.files, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business photos updated successfully',
        data: business,
      });
    } catch (error) {
      console.error('Photo update error:', error);
      next(error);
    }
  },

  async deleteImage(req, res, next) {
    try {
      console.log('=== DELETE IMAGE DEBUG ===');
      console.log('Business ID:', req.params.id);
      console.log('Public ID:', req.params.publicId);
      console.log('User:', req.user);
      
      const business = await BusinessService.deleteImage(req.params.id, req.params.publicId, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Image deleted successfully',
        data: business,
      });
    } catch (error) {
      console.error('Image delete error:', error);
      next(error);
    }
  },

  async updateHours(req, res, next) {
    try {
      const business = await BusinessService.updateHours(req.params.id, req.body.hours, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business hours updated successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await BusinessService.getCategories();
      sendResponse(res, 200, {
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async search(req, res, next) {
    try {
      const { query, category, page = 1, limit = 10 } = req.query;
      const businesses = await BusinessService.search({ query, category, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: businesses,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      const businesses = await BusinessService.getAll({ status, search, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: businesses,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const business = await BusinessService.getById(req.params.id);
      sendResponse(res, 200, {
        success: true,
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const business = await BusinessService.update(req.params.id, req.body, req.files, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business updated successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async approve(req, res, next) {
    try {
      const business = await BusinessService.updateStatus(req.params.id, 'approved', req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business approved successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async reject(req, res, next) {
    try {
      const business = await BusinessService.updateStatus(req.params.id, 'rejected', req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Business rejected successfully',
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const business = await BusinessService.updateStatus(req.params.id, status, req.user);
      sendResponse(res, 200, {
        success: true,
        message: `Business status updated to ${status} successfully`,
        data: business,
      });
    } catch (error) {
      next(error);
    }
  },
};