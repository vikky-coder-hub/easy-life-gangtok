// src/api/validators/finance.js
import { z } from 'zod';

export const validateFinance = (req, res, next) => {
  const transactionSchema = z.object({
    amount: z.number().positive(),
    type: z.enum(['income', 'expense', 'refund']),
    category: z.string().min(1),
    description: z.string().optional(),
    businessId: z.string().optional(),
    bookingId: z.string().optional(),
  });

  const paymentSchema = z.object({
    amount: z.number().positive(),
    paymentMethod: z.enum(['card', 'upi', 'cash', 'bank_transfer']),
    bookingId: z.string().min(1),
  });

  try {
    if (req.path.includes('/transaction')) {
      transactionSchema.parse(req.body);
    } else if (req.path.includes('/payment')) {
      paymentSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
