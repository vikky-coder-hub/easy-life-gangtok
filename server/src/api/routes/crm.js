import express from 'express';
import { crmController } from '../controllers/index.js';
import { validateCRM } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.get('/customers', authenticate, restrictTo('admin'), crmController.getCustomers);
router.get('/leads', authenticate, restrictTo('admin'), crmController.getLeads);
router.put('/customers/:id/notes', authenticate, restrictTo('admin'), validateCRM, crmController.addCustomerNote);

export { router as default, router as crmRouter };