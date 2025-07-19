import express from 'express';
import { sellerCustomerController } from '../controllers/index.js';
import { authenticate, restrictTo } from '../middlewares/index.js';

const router = express.Router();

// All routes require seller authentication
router.use(authenticate);
router.use(restrictTo('seller'));

// Customer management routes for sellers
router.get('/analytics', sellerCustomerController.getCustomerAnalytics);
router.get('/analytics/detailed', sellerCustomerController.getDetailedCustomerInsights);
router.get('/overview', sellerCustomerController.getCustomerOverview);
router.get('/insights', sellerCustomerController.getCustomerInsights);
router.get('/list', sellerCustomerController.getCustomerList);
router.get('/:customerId', sellerCustomerController.getCustomerDetails);
router.get('/:customerId/communication-history', sellerCustomerController.getCommunicationHistory);

// Customer notes management
router.get('/:customerId/notes', sellerCustomerController.getCustomerNotes);
router.post('/:customerId/notes', sellerCustomerController.addCustomerNote);
router.put('/notes/:noteId', sellerCustomerController.updateCustomerNote);
router.delete('/notes/:noteId', sellerCustomerController.deleteCustomerNote);

// Customer actions
router.post('/:customerId/message', sellerCustomerController.sendMessage);
router.post('/:customerId/follow-up', sellerCustomerController.scheduleFollowUp);
router.put('/:customerId/segment', sellerCustomerController.updateCustomerSegment);

export { router as default, router as sellerCustomerRouter };
