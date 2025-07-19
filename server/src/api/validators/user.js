// src/api/validators/user.js
import { z } from 'zod';

export const validateUser = (req, res, next) => {
  const updateUserSchema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?\d{10,15}$/).optional(),
    userType: z.enum(['customer', 'seller', 'admin']).optional(),
  });

  const banUserSchema = z.object({
    reason: z.string().min(1),
  });

  try {
    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (req.path.includes('/ban')) {
        banUserSchema.parse(req.body);
      } else {
        updateUserSchema.parse(req.body);
      }
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
