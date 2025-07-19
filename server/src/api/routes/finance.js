import express from 'express';
import { financeController } from '../controllers/index.js';
import { validateFinance } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.get('/dashboard', authenticate, restrictTo('admin'), validateFinance, financeController.getDashboard);
router.get('/pending', authenticate, restrictTo('admin'), financeController.getPendingSettlements);
router.post('/process', authenticate, restrictTo('admin'), validateFinance, financeController.processSettlements);

export { router as default, router as financeRouter };