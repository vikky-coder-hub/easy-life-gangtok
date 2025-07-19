// src/api/validators/review.js
import { z } from 'zod';

export const validateReview = (req, res, next) => {
  const reviewSchema = z.object({
    businessId: z.string().min(1),
    rating: z.number().min(1).max(5),
    comment: z.string().min(1).max(500).optional(),
    serviceDate: z.string().optional(),
  });

  const updateReviewSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().min(1).max(500).optional(),
  });

  try {
    if (req.method === 'POST') {
      reviewSchema.parse(req.body);
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      updateReviewSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
