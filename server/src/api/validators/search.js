// src/api/validators/search.js
import { z } from 'zod';

export const validateSearch = (req, res, next) => {
  const searchSchema = z.object({
    q: z.string().min(1).optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    type: z.enum(['business', 'user', 'booking']).optional(),
  });

  try {
    if (req.method === 'GET') {
      searchSchema.parse(req.query);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
