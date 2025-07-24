import express from 'express';
import { notificationController } from '../controllers/index.js';
import { validateNotification } from '../validators/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

router.get('/', authenticate, notificationController.getAll);
router.get('/unread', authenticate, notificationController.getUnread);
router.get('/stats', authenticate, notificationController.getStats);
router.post('/send', authenticate, restrictTo('admin'), validateNotification, notificationController.send);
router.put('/mark-all-read', authenticate, notificationController.markAllAsRead);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/:id', authenticate, notificationController.delete);

export { router as default, router as notificationRouter };