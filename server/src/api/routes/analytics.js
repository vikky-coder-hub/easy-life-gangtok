import express from 'express';
import { analyticsController } from '../controllers/index.js';
import { validateAnalytics } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

// Dashboard routes
router.get('/dashboard/customer', authenticate, restrictTo('customer'), analyticsController.getCustomerDashboard);
router.get('/dashboard/seller', authenticate, restrictTo('seller'), analyticsController.getSellerDashboard);
router.get('/dashboard/admin', authenticate, restrictTo('admin'), analyticsController.getAdminDashboard);

router.get('/business/:id', authenticate, restrictTo('admin', 'seller'), validateAnalytics, analyticsController.getBusinessAnalytics);
router.get('/customer/:id', authenticate, restrictTo('admin'), validateAnalytics, analyticsController.getCustomerAnalytics);
router.get('/platform', authenticate, restrictTo('admin'), validateAnalytics, analyticsController.getPlatformAnalytics);
router.get('/reports/financial', authenticate, restrictTo('admin'), validateAnalytics, analyticsController.getFinancialReports);
router.get('/reports/user-activity', authenticate, restrictTo('admin'), validateAnalytics, analyticsController.getUserActivityReports);

export { router as default, router as analyticsRouter };