// src/api/validators/upload.js
import { z } from 'zod';

export const validateUpload = (req, res, next) => {
  const uploadSchema = z.object({
    folder: z.string().optional(),
    type: z.enum(['image', 'document']).optional(),
  });

  try {
    if (req.method === 'POST') {
      // For file uploads, we mainly validate through multer middleware
      // This is for any additional body parameters
      uploadSchema.parse(req.body);
    }
    next();
  } catch (error) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: error.errors 
    });
  }
};
