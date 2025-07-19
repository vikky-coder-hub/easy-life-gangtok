import { ReviewService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const reviewController = {
  async create(req, res, next) {
    try {
      const review = await ReviewService.create(req.body, req.user);
      sendResponse(res, 201, {
        success: true,
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { businessId, page = 1, limit = 10 } = req.query;
      const reviews = await ReviewService.getAll({ businessId, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const review = await ReviewService.update(req.params.id, req.body, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await ReviewService.delete(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async flagReview(req, res, next) {
    try {
      const review = await ReviewService.flagReview(req.params.id, req.body.isFlagged);
      sendResponse(res, 200, {
        success: true,
        message: `Review ${req.body.isFlagged ? 'flagged' : 'unflagged'} successfully`,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },
};