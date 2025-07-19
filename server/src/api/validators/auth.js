// src/api/validators/auth.js
import { z } from 'zod';

export const validateAuth = (req, res, next) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const signupSchema = z.object({
    name: z.string().min(2).optional(),
    fullName: z.string().min(2).optional(),
    email: z.string().email(),
    phone: z.string().regex(/^(\+?\d{10,15})$/),
    password: z.string().min(6),
    confirmPassword: z.string().min(6).optional(),
    userType: z.enum(['customer', 'seller', 'admin']),
    // Business Partner Fields
    businessName: z.string().optional(),
    businessType: z.enum(['product', 'service', 'bike_rider', 'taxi_service']).optional(),
    businessAddress: z.string().optional(),
    productCategories: z.array(z.string()).optional(),
    serviceCategories: z.array(z.string()).optional(),
  }).refine((data) => {
    // Require name or fullName
    return data.name || data.fullName;
  }, {
    message: "Either name or fullName is required",
    path: ["name"]
  }).refine((data) => {
    // If seller, require business fields
    if (data.userType === 'seller') {
      return data.businessName && data.businessType && data.businessAddress;
    }
    return true;
  }, {
    message: "Business fields are required for sellers",
    path: ["businessName"]
  });

  const otpSchema = z.object({
    phone: z.string().regex(/^(\+?\d{10,15})$/),
    otp: z.string().length(6),
  });

  const sendOtpSchema = z.object({
    phone: z.string().regex(/^(\+?\d{10,15})$/),
  });

  try {
    if (req.path === '/login') {
      loginSchema.parse(req.body);
    } else if (req.path === '/signup') {
      signupSchema.parse(req.body);
    } else if (req.path === '/login-otp' || req.path === '/verify-otp') {
      otpSchema.parse(req.body);
    } else if (req.path === '/send-otp') {
      sendOtpSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};