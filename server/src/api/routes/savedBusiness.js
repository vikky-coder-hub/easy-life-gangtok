import express from 'express';
import { savedBusinessController } from '../controllers/savedBusiness.js';
import { authenticate, restrictTo } from '../middlewares/auth.js';

const router = express.Router();

// Get customer's saved businesses
router.get('/', authenticate, restrictTo('customer'), savedBusinessController.getMySavedBusinesses);

// Save a business
router.post('/:businessId', authenticate, restrictTo('customer'), savedBusinessController.saveBusiness);

// Remove a business from saved list
router.delete('/:businessId', authenticate, restrictTo('customer'), savedBusinessController.unsaveBusiness);

// Check if business is saved
router.get('/check/:businessId', authenticate, restrictTo('customer'), savedBusinessController.checkIfBusinessSaved);

export { router as savedBusinessRouter };