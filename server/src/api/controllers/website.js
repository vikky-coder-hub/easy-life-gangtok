import { WebsiteService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const websiteController = {
  async getConfig(req, res, next) {
    try {
      const config = await WebsiteService.getConfig();
      sendResponse(res, 200, {
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateConfig(req, res, next) {
    try {
      const config = await WebsiteService.updateConfig(req.body, req.files);
      sendResponse(res, 200, {
        success: true,
        message: 'Website configuration updated successfully',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await WebsiteService.getCategories();
      sendResponse(res, 200, {
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCategories(req, res, next) {
    try {
      const categories = await WebsiteService.updateCategories(req.body);
      sendResponse(res, 200, {
        success: true,
        message: 'Categories updated successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  },
};