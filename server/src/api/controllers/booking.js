import { BookingService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const bookingController = {
  async bookService(req, res, next) {
    try {
      const booking = await BookingService.create(req.body, req.user);
      sendResponse(res, 201, {
        success: true,
        message: 'Service booked successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCustomerBookings(req, res, next) {
    try {
      const bookings = await BookingService.getCustomerBookings(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyBookings(req, res, next) {
    try {
      const bookings = await BookingService.getCustomerBookings(req.user.userId, req.user);
      sendResponse(res, 200, {
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  async getSellerBookings(req, res, next) {
    try {
      const bookings = await BookingService.getSellerBookings(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  async confirm(req, res, next) {
    try {
      const booking = await BookingService.updateStatus(req.params.id, 'confirmed', null, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Booking confirmed successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  async cancel(req, res, next) {
    try {
      const { cancellationReason } = req.body;
      const booking = await BookingService.updateStatus(req.params.id, 'cancelled', cancellationReason, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  async complete(req, res, next) {
    try {
      const booking = await BookingService.updateStatus(req.params.id, 'completed', null, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'Booking completed successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      const bookings = await BookingService.getAll({ status, search, page, limit }, req.user);
      sendResponse(res, 200, {
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const booking = await BookingService.getById(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },
};