import { CRMService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const crmController = {
  async getCustomers(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const customers = await CRMService.getCustomers({ search, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  },

  async getLeads(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const leads = await CRMService.getLeads({ status, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  },

  async addCustomerNote(req, res, next) {
    try {
      const note = await CRMService.addCustomerNote(req.params.id, req.body.note, req.user);
      sendResponse(res, 201, {
        success: true,
        message: 'Customer note added successfully',
        data: note,
      });
    } catch (error) {
      next(error);
    }
  },
};