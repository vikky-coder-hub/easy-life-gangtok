import express from 'express';
import { activityController } from '../controllers/activity.js';
import { authenticate, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Customer activity routes
router.get('/customer/me', authenticate, restrictTo('customer'), activityController.getMyActivity);
router.get('/customer/:id', authenticate, restrictTo('admin'), activityController.getCustomerActivity);

export { router as activityRouter };
