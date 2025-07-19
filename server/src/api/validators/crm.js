// src/api/validators/crm.js
import { z } from 'zod';

export const validateCRM = (req, res, next) => {
  const leadSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^\+?\d{10,15}$/),
    source: z.enum(['website', 'referral', 'social', 'ads']),
    status: z.enum(['new', 'contacted', 'qualified', 'converted']).optional(),
    notes: z.string().optional(),
  });

  const customerNoteSchema = z.object({
    customerId: z.string().min(1),
    note: z.string().min(1),
    type: z.enum(['general', 'complaint', 'compliment', 'follow_up']),
  });

  try {
    if (req.path.includes('/lead')) {
      leadSchema.parse(req.body);
    } else if (req.path.includes('/note')) {
      customerNoteSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
