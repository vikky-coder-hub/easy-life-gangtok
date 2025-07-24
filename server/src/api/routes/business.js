import express from 'express';
import { businessController } from '../controllers/index.js';
import { validateBusiness, validateBusinessUpdate } from '../validators/index.js';
import { authenticate, restrictTo, multerMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.post('/submit', authenticate, restrictTo('seller'), multerMiddleware.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 5 },
]), validateBusiness, businessController.submit);
router.get('/my-business', authenticate, restrictTo('seller'), businessController.getMyBusiness);
router.put('/:id/photos', authenticate, restrictTo('seller', 'admin'), multerMiddleware.array('images', 6), businessController.updatePhotos);
router.delete('/:id/images/:publicId', authenticate, restrictTo('seller', 'admin'), businessController.deleteImage);
router.put('/:id/hours', authenticate, restrictTo('seller', 'admin'), validateBusiness, businessController.updateHours);
router.get('/categories', businessController.getCategories);
router.get('/search', businessController.search);
router.get('/', businessController.getAll);
router.get('/:id', businessController.getById);
router.put('/:id', authenticate, restrictTo('seller', 'admin'), multerMiddleware.fields([
  { name: 'images', maxCount: 5 },
  { name: 'documents', maxCount: 5 },
]), validateBusinessUpdate, businessController.update);
router.put('/:id/approve', authenticate, restrictTo('admin'), businessController.approve);
router.put('/:id/reject', authenticate, restrictTo('admin'), businessController.reject);
router.put('/:id/status', authenticate, restrictTo('admin'), validateBusiness, businessController.updateStatus);

export { router as default, router as businessRouter };