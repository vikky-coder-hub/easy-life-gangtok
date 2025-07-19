import { z } from 'zod';

export const validateSettlement = (req, res, next) => {
  const statusSchema = z.object({
    status: z.enum(['pending', 'processing', 'completed']),
  });

  try {
    statusSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};