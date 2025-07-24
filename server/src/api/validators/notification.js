// src/api/validators/notification.js
import { z } from 'zod';

export const validateNotification = (req, res, next) => {
  const notificationSchema = z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.enum(['booking', 'payment', 'review', 'inquiry', 'system', 'business', 'urgent', 'warning', 'success', 'info']),
    category: z.enum(['security', 'financial', 'business', 'content', 'system', 'users']).optional(),
    userId: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    actionRequired: z.boolean().optional(),
    relatedId: z.string().optional(),
    relatedModel: z.enum(['Booking', 'Business', 'User', 'Review', 'Transaction']).optional(),
    amount: z.number().optional(),
    customer: z.string().optional(),
    source: z.string().optional(),
    actions: z.array(z.string()).optional(),
    metadata: z.any().optional(),
  });

  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      notificationSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};