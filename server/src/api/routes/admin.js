import express from 'express';
import { adminController, userController, settlementController } from '../controllers/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.get('/users', authenticate, restrictTo('admin'), adminController.getUserAnalytics);
router.get('/users/banned', authenticate, restrictTo('admin'), userController.getBanned);
router.get('/businesses/pending', authenticate, restrictTo('admin'), adminController.getPendingBusinesses);
router.put('/businesses/:id/approve', authenticate, restrictTo('admin'), adminController.approveBusiness);
router.put('/businesses/:id/reject', authenticate, restrictTo('admin'), adminController.rejectBusiness);
router.get('/businesses/under-review', authenticate, restrictTo('admin'), adminController.getUnderReviewBusinesses);
router.get('/dashboard', authenticate, restrictTo('admin'), adminController.getSystemStats);
router.get('/settlements', authenticate, restrictTo('admin'), settlementController.getAll);

export { router as default, router as adminRouter };