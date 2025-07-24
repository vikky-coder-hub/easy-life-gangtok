import { z } from 'zod';

export const validateBusinessUpdate = (req, res, next) => {
  const businessUpdateSchema = z.object({
    title: z.string().min(2).optional(),
    name: z.string().optional(),
    category: z.string().min(1).optional(),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }).optional(),
    }).optional(),
    contact: z.object({
      phone: z.string().optional(),
      email: z.union([z.string().email(), z.literal("")]).optional(),
      website: z.union([z.string().url(), z.literal("")]).optional(),
    }).optional(),
    businessHours: z.object({
      monday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      tuesday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      wednesday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      thursday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      friday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      saturday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      sunday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
    }).optional(),
    services: z.array(z.string()).optional(),
    pricing: z.string().optional(),
  });

  try {
    businessUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    console.error('Validation error:', error.errors);
    res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: error.errors 
    });
  }
};

export const validateBusiness = (req, res, next) => {
  const businessSchema = z.object({
    title: z.string().min(2),
    name: z.string().optional(),
    category: z.string().min(1),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
      coordinates: z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }).optional(),
    }).optional(),
    contact: z.object({
      phone: z.string().optional(),
      email: z.union([z.string().email(), z.literal("")]).optional(),
      website: z.union([z.string().url(), z.literal("")]).optional(),
    }).optional(),
    businessHours: z.object({
      monday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      tuesday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      wednesday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      thursday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      friday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      saturday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      sunday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
    }).optional(),
    services: z.array(z.string()).optional(),
    pricing: z.string().optional(),
  });

  const statusSchema = z.object({
    status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'banned']),
  });

  const hoursSchema = z.object({
    hours: z.object({
      monday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      tuesday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      wednesday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      thursday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      friday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      saturday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
      sunday: z.object({
        open: z.string(),
        close: z.string(),
        isOpen: z.boolean().optional(),
      }).optional(),
    }),
  });

  try {
    if (req.path.includes('/status')) {
      statusSchema.parse(req.body);
    } else if (req.path.includes('/hours')) {
      hoursSchema.parse(req.body);
    } else {
      businessSchema.parse(req.body);
    }
    next();
  } catch (error) {
    console.error('Validation error:', error.errors);
    res.status(400).json({ 
      success: false,
      error: 'Validation failed',
      details: error.errors 
    });
  }
};