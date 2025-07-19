import express from 'express';
import { websiteController } from '../controllers/index.js';
import { validateWebsite } from '../validators/index.js';
import { authenticate, restrictTo, multerMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.get('/homepage-config', websiteController.getConfig);
router.put('/homepage-config', authenticate, restrictTo('admin'), multerMiddleware.fields([
  { name: 'hotDealsImages', maxCount: 10 },
  { name: 'teamImages', maxCount: 10 },
]), validateWebsite, websiteController.updateConfig);
router.get('/categories', websiteController.getCategories);
router.put('/categories', authenticate, restrictTo('admin'), validateWebsite, websiteController.updateCategories);

export { router as default, router as websiteRouter };