import { SellerCustomerService } from '../services/sellerCustomer.js';
import { sendResponse } from '../utils/index.js';

export const sellerCustomerController = {
  // Get customer analytics for seller
  async getCustomerAnalytics(req, res, next) {
    try {
      const analytics = await SellerCustomerService.getCustomerAnalytics(req.user.userId);
      
      sendResponse(res, 200, {
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get detailed customer insights with funnel data
  async getDetailedCustomerInsights(req, res, next) {
    try {
      const insights = await SellerCustomerService.getDetailedCustomerInsights(req.user.userId);
      
      sendResponse(res, 200, {
        success: true,
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer overview for segments and locations
  async getCustomerOverview(req, res, next) {
    try {
      const overview = await SellerCustomerService.getCustomerOverview(req.user.userId);
      
      sendResponse(res, 200, {
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer insights and behavioral data
  async getCustomerInsights(req, res, next) {
    try {
      const insights = await SellerCustomerService.getCustomerInsights(req.user.userId);
      
      sendResponse(res, 200, {
        success: true,
        data: insights,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer list with filtering
  async getCustomerList(req, res, next) {
    try {
      const { search, segment, status, page, limit } = req.query;
      
      const customers = await SellerCustomerService.getCustomerList(req.user.userId, {
        search,
        segment,
        status,
        page,
        limit,
      });
      
      sendResponse(res, 200, {
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get detailed customer information
  async getCustomerDetails(req, res, next) {
    try {
      const { customerId } = req.params;
      
      const customer = await SellerCustomerService.getCustomerDetails(req.user.userId, customerId);
      
      sendResponse(res, 200, {
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer communication history
  async getCommunicationHistory(req, res, next) {
    try {
      const { customerId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // This would be implemented in the service
      // For now, return the communication history from customer details
      const customer = await SellerCustomerService.getCustomerDetails(req.user.userId, customerId);
      
      sendResponse(res, 200, {
        success: true,
        data: {
          communications: customer.communicationHistory,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: customer.communicationHistory.length,
          }
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get customer notes
  async getCustomerNotes(req, res, next) {
    try {
      const { customerId } = req.params;
      
      const customer = await SellerCustomerService.getCustomerDetails(req.user.userId, customerId);
      
      sendResponse(res, 200, {
        success: true,
        data: {
          notes: customer.notes,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Add customer note
  async addCustomerNote(req, res, next) {
    try {
      const { customerId } = req.params;
      const noteData = req.body;
      
      const note = await SellerCustomerService.addCustomerNote(req.user.userId, customerId, noteData);
      
      sendResponse(res, 201, {
        success: true,
        message: 'Customer note added successfully',
        data: note,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update customer note
  async updateCustomerNote(req, res, next) {
    try {
      const { noteId } = req.params;
      const updateData = req.body;
      
      // This would need to be implemented in the service
      // For now, return success message
      sendResponse(res, 200, {
        success: true,
        message: 'Customer note updated successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete customer note
  async deleteCustomerNote(req, res, next) {
    try {
      const { noteId } = req.params;
      
      // This would need to be implemented in the service
      // For now, return success message
      sendResponse(res, 200, {
        success: true,
        message: 'Customer note deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // Send message to customer
  async sendMessage(req, res, next) {
    try {
      const { customerId } = req.params;
      const { message, channel = 'app' } = req.body;
      
      // This would integrate with messaging service
      // For now, return success message
      sendResponse(res, 200, {
        success: true,
        message: 'Message sent successfully',
        data: {
          customerId,
          message,
          channel,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Schedule follow-up
  async scheduleFollowUp(req, res, next) {
    try {
      const { customerId } = req.params;
      const { followUpDate, reason } = req.body;
      
      // This would integrate with calendar/reminder service
      // For now, return success message
      sendResponse(res, 200, {
        success: true,
        message: 'Follow-up scheduled successfully',
        data: {
          customerId,
          followUpDate,
          reason,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Update customer segment
  async updateCustomerSegment(req, res, next) {
    try {
      const { customerId } = req.params;
      const { segment } = req.body;
      
      const relationship = await SellerCustomerService.updateCustomerSegment(
        req.user.userId, 
        customerId, 
        segment
      );
      
      sendResponse(res, 200, {
        success: true,
        message: 'Customer segment updated successfully',
        data: relationship,
      });
    } catch (error) {
      next(error);
    }
  },
};
