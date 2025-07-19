// src/api/middlewares/index.js
import { authenticate, restrictTo } from './auth.js';
import { errorHandler } from './error.js';
import { multerMiddleware } from './multer.js';
import { rateLimiter } from './rateLimiter.js';

export { authenticate, restrictTo, errorHandler, multerMiddleware, rateLimiter };