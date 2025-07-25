import express from 'express';
import { reviewController } from '../controllers/index.js';
import { validateReview } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.post('/', authenticate, restrictTo('customer'), validateReview, reviewController.create);
router.get('/seller/me', authenticate, restrictTo('seller'), reviewController.getSellerReviews);
router.get('/business/:id', reviewController.getAll);
router.put('/:id', authenticate, restrictTo('customer'), validateReview, reviewController.update);
router.delete('/:id', authenticate, restrictTo('customer', 'admin'), reviewController.delete);
router.patch('/:id/flag', authenticate, restrictTo('admin'), validateReview, reviewController.flagReview);

export { router as default, router as reviewRouter };