import express from 'express';
import { searchController } from '../controllers/index.js';
import { validateSearch } from '../validators/index.js';

const router = express.Router();

router.get('/businesses', validateSearch, searchController.searchBusinesses);
router.get('/services', validateSearch, searchController.searchServices);
router.get('/suggestions', validateSearch, searchController.getSuggestions);

export { router as default, router as searchRouter };