import { SearchService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const searchController = {
  async searchBusinesses(req, res, next) {
    try {
      const { query, category, page = 1, limit = 10 } = req.query;
      const results = await SearchService.searchBusinesses({ query, category, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  async searchServices(req, res, next) {
    try {
      const { query, page = 1, limit = 10 } = req.query;
      const results = await SearchService.searchServices({ query, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSuggestions(req, res, next) {
    try {
      const { query } = req.query;
      const suggestions = await SearchService.getSuggestions(query);
      sendResponse(res, 200, {
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  },
};