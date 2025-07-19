import express from 'express';
import { settlementController } from '../controllers/index.js';
import { validateSettlement } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.get('/', authenticate, restrictTo('admin'), settlementController.getAll);
router.get('/pending', authenticate, restrictTo('admin'), settlementController.getPending);
router.post('/process', authenticate, restrictTo('admin'), validateSettlement, settlementController.process);

export { router as default, router as settlementRouter };