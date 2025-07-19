import express from 'express';
import { authController } from '../controllers/index.js';
import { validateAuth } from '../validators/index.js';
import { authenticate, multerMiddleware } from '../middlewares/index.js';

const router = express.Router();

router.get('/test', (req, res) => res.json({ message: 'Auth routes working!' }));
router.post('/login', validateAuth, authController.login);
router.post('/signup', validateAuth, authController.signup);
router.post('/send-otp', validateAuth, authController.sendOTP);
router.post('/verify-otp', validateAuth, authController.verifyOTP);
router.post('/login-otp', validateAuth, authController.loginWithOTP);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, multerMiddleware.single('avatar'), validateAuth, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

export { router as default, router as authRouter };