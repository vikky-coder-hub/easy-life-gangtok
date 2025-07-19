import express from 'express';
import { uploadController } from '../controllers/index.js';
import { authenticate, restrictTo, multerMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.post('/images', authenticate, restrictTo('admin', 'seller'), multerMiddleware.array('images', 10), uploadController.uploadImages);
router.post('/documents', authenticate, restrictTo('admin', 'seller'), multerMiddleware.array('documents', 5), uploadController.uploadDocuments);
router.delete('/:id', authenticate, restrictTo('admin', 'seller'), uploadController.deleteFile);

export { router as default, router as uploadRouter };