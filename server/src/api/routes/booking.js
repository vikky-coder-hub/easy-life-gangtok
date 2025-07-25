import express from 'express';
import { bookingController } from '../controllers/index.js';
import { validateBooking } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

// Specific routes must come before parameterized routes
router.get('/my-seller-bookings', authenticate, restrictTo('seller'), bookingController.getMySellerBookings);
router.get('/my-seller-stats', authenticate, restrictTo('seller'), bookingController.getSellerOrderStats);
router.get('/customer/me', authenticate, restrictTo('customer'), bookingController.getMyBookings);

// Service booking
router.post('/service', authenticate, restrictTo('customer'), validateBooking, bookingController.bookService);

// Parameterized routes
router.get('/customer/:id', authenticate, bookingController.getCustomerBookings);
router.get('/seller/:id', authenticate, restrictTo('seller', 'admin'), bookingController.getSellerBookings);

// Status updates
router.put('/:id/confirm', authenticate, restrictTo('seller', 'admin'), bookingController.confirm);
router.put('/:id/cancel', authenticate, restrictTo('customer', 'admin'), validateBooking, bookingController.cancel);
router.put('/:id/complete', authenticate, restrictTo('seller', 'admin'), bookingController.complete);

// General routes
router.get('/', authenticate, bookingController.getAll);
router.get('/:id', authenticate, bookingController.getById);

export { router as default, router as bookingRouter };