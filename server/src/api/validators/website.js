import { z } from 'zod';

export const validateWebsite = (req, res, next) => {
  const websiteSchema = z.object({
    homepage: z.object({
      hero: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
      }).optional(),
      categoriesGrid: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        selectedCategories: z.array(z.string()).optional(),
        showViewAllButton: z.boolean().optional(),
      }).optional(),
      hotDeals: z.object({
        title: z.string().optional(),
        maxItems: z.number().optional(),
        products: z.array(z.object({
          id: z.number(),
          title: z.string(),
          category: z.string(),
          price: z.string(),
          originalPrice: z.string().optional(),
          discount: z.string().optional(),
          rating: z.number(),
          reviews: z.number(),
          seller: z.string(),
          location: z.string(),
          image: z.string().optional(),
          publicId: z.string().optional(),
        })).optional(),
      }).optional(),
      serviceSlider: z.object({
        enabled: z.boolean().optional(),
        title: z.string().optional(),
        selectedCategory: z.string().optional(),
        description: z.string().optional(),
        maxItems: z.number().optional(),
        isRandomized: z.boolean().optional(),
      }).optional(),
    }).optional(),
    about: z.object({
      hero: z.object({
        title: z.string().optional(),
        subtitle: z.string().optional(),
        description: z.string().optional(),
      }).optional(),
      mission: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }).optional(),
      vision: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
      }).optional(),
      team: z.array(z.object({
        name: z.string(),
        role: z.string(),
        image: z.string().optional(),
        publicId: z.string().optional(),
      })).optional(),
      coreValues: z.array(z.string()).optional(),
      stats: z.array(z.object({
        title: z.string(),
        value: z.string(),
      })).optional(),
    }).optional(),
  }).optional();

  try {
    websiteSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};