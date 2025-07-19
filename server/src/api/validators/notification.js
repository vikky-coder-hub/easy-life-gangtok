// src/api/validators/notification.js
import { z } from 'zod';

export const validateNotification = (req, res, next) => {
  const notificationSchema = z.object({
    title: z.string().min(1),
    message: z.string().min(1),
    type: z.enum(['info', 'success', 'warning', 'error']),
    userId: z.string().optional(),
    businessId: z.string().optional(),
    isRead: z.boolean().optional(),
  });

  const markReadSchema = z.object({
    notificationIds: z.array(z.string()),
  });

  try {
    if (req.path.includes('/mark-read')) {
      markReadSchema.parse(req.body);
    } else if (req.method === 'POST' || req.method === 'PUT') {
      notificationSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};