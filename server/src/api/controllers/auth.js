import { AuthService } from '../services/index.js';
import { NotFoundError, ValidationError } from '../middlewares/error.js';

export const authController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async signup(req, res, next) {
    try {
      console.log('Signup request body:', req.body);
      const result = await AuthService.signup(req.body);
      console.log('Signup successful:', result.user.email);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      console.error('Signup error:', error.message);
      next(error);
    }
  },

  async sendOTP(req, res, next) {
    try {
      const { phone } = req.body;
      const result = await AuthService.sendOTP(phone);
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyOTP(req, res, next) {
    try {
      const { phone, otp } = req.body;
      const result = await AuthService.verifyOTP(phone, otp);
      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async loginWithOTP(req, res, next) {
    try {
      const { phone, otp } = req.body;
      const result = await AuthService.loginWithOTP(phone, otp);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user.userId, req.body, req.file);
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await AuthService.logout(req.user.userId);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};