import { z } from 'zod';

export const validateSettings = (req, res, next) => {
  const settingsSchema = z.object({
    siteName: z.string().optional(),
    siteDescription: z.string().optional(),
    contactEmail: z.string().email().optional(),
    supportPhone: z.string().optional(),
    address: z.string().optional(),
    emailProvider: z.enum(['gmail', 'outlook', 'custom']).optional(),
    smtpHost: z.string().optional(),
    smtpPort: z.string().optional(),
    smtpUsername: z.string().optional(),
    smtpPassword: z.string().optional(),
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    weeklyReports: z.boolean().optional(),
    twoFactorAuth: z.boolean().optional(),
    sessionTimeout: z.number().optional(),
    passwordPolicy: z.enum(['basic', 'medium', 'strong']).optional(),
    autoApproval: z.boolean().optional(),
    verificationRequired: z.boolean().optional(),
    businessLimit: z.number().optional(),
    reviewModeration: z.boolean().optional(),
    primaryColor: z.string().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
  });

  try {
    settingsSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};