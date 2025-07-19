import { SettlementService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const settlementController = {
  async getAll(req, res, next) {
    try {
      const { status, dateRange, search, page = 1, limit = 10 } = req.query;
      const settlements = await SettlementService.getAll({ status, dateRange, search, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: settlements,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPending(req, res, next) {
    try {
      const settlements = await SettlementService.getPending(req.query);
      sendResponse(res, 200, {
        success: true,
        data: settlements,
      });
    } catch (error) {
      next(error);
    }
  },

  async process(req, res, next) {
    try {
      const settlement = await SettlementService.process(req.body.settlementIds);
      sendResponse(res, 200, {
        success: true,
        message: 'Settlements processed successfully',
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  },
};