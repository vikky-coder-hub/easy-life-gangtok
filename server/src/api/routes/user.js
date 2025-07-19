import express from 'express';
import { userController } from '../controllers/index.js';
import { validateUser } from '../validators/index.js';
import { authenticate, restrictTo, multerMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.get('/', authenticate, restrictTo('admin'), userController.getAll);
router.get('/banned', authenticate, restrictTo('admin'), userController.getBanned);
router.get('/:id', authenticate, userController.getById);
router.put('/:id', authenticate, multerMiddleware.single('avatar'), validateUser, userController.update);
router.patch('/:id/ban', authenticate, restrictTo('admin'), validateUser, userController.banUser);
router.delete('/:id', authenticate, restrictTo('admin'), userController.delete);

export { router as default, router as userRouter };