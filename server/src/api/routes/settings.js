import express from 'express';
import { settingsController } from '../controllers/index.js';
import { validateSettings } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.get('/', authenticate, restrictTo('admin'), settingsController.getSettings);
router.put('/', authenticate, restrictTo('admin'), validateSettings, settingsController.updateSettings);

export { router as default, router as settingsRouter };