import { FinanceService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const financeController = {
  async getDashboard(req, res, next) {
    try {
      const dashboard = await FinanceService.getDashboard(req.query.period);
      sendResponse(res, 200, {
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  async getPendingSettlements(req, res, next) {
    try {
      const settlements = await FinanceService.getPendingSettlements(req.query);
      sendResponse(res, 200, {
        success: true,
        data: settlements,
      });
    } catch (error) {
      next(error);
    }
  },

  async processSettlements(req, res, next) {
    try {
      const settlements = await FinanceService.processSettlements(req.body.settlementIds);
      sendResponse(res, 200, {
        success: true,
        message: 'Settlements processed successfully',
        data: settlements,
      });
    } catch (error) {
      next(error);
    }
  },
};