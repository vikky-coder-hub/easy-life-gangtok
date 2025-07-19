import express from 'express';
import { bookingController } from '../controllers/index.js';
import { validateBooking } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.post('/service', authenticate, restrictTo('customer'), validateBooking, bookingController.bookService);
router.get('/customer/me', authenticate, restrictTo('customer'), bookingController.getMyBookings);
router.get('/customer/:id', authenticate, bookingController.getCustomerBookings);
router.get('/seller/:id', authenticate, restrictTo('seller', 'admin'), bookingController.getSellerBookings);
router.put('/:id/confirm', authenticate, restrictTo('seller', 'admin'), bookingController.confirm);
router.put('/:id/cancel', authenticate, restrictTo('customer', 'admin'), validateBooking, bookingController.cancel);
router.put('/:id/complete', authenticate, restrictTo('seller', 'admin'), bookingController.complete);
router.get('/', authenticate, bookingController.getAll);
router.get('/:id', authenticate, bookingController.getById);

export { router as default, router as bookingRouter };