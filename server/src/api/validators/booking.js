import { z } from 'zod';

export const validateBooking = (req, res, next) => {
  const bookingSchema = z.object({
    businessId: z.string(),
    service: z.string().min(1),
    eventDate: z.string().datetime(),
    eventTime: z.string(),
    location: z.string(),
    amount: z.number().min(0),
    guestCount: z.number().int().min(1),
    specialRequests: z.string().optional(),
  });

  const statusSchema = z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
    cancellationReason: z.string().optional(),
  });

  try {
    if (req.path.includes('/status')) {
      statusSchema.parse(req.body);
    } else {
      bookingSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};