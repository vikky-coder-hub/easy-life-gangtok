import { z } from 'zod';

export const validateAdmin = (req, res, next) => {
  const analyticsSchema = z.object({
    period: z.enum(['last7days', 'last30days', 'last90days', 'lastyear']).optional(),
  });

  const banSchema = z.object({
    isBanned: z.boolean(),
  });

  try {
    if (req.path.includes('/users') || req.path.includes('/businesses') || req.path.includes('/analytics')) {
      analyticsSchema.parse(req.query);
    } else if (req.path.includes('/ban')) {
      banSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};