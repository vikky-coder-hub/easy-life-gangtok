import { z } from 'zod';

export const validateAnalytics = (req, res, next) => {
  const analyticsSchema = z.object({
    period: z.enum(['last7days', 'last30days', 'last90days', 'lastyear']).optional(),
  });

  try {
    analyticsSchema.parse(req.query);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};