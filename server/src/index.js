import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimiter, errorHandler, multerMiddleware } from './api/middlewares/index.js';
import { authRouter, adminRouter, businessRouter, bookingRouter, settlementRouter, notificationRouter, analyticsRouter, settingsRouter, websiteRouter, userRouter, reviewRouter, searchRouter, financeRouter, crmRouter, uploadRouter, activityRouter, savedBusinessRouter, sellerCustomerRouter } from './api/routes/index.js';
import { cloudinaryConfig } from './api/utils/cloudinary.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(rateLimiter);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Cloudinary configuration
cloudinaryConfig();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/businesses', businessRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/settlements', settlementRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/website', websiteRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/search', searchRouter);
app.use('/api/finances', financeRouter);
app.use('/api/crm', crmRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/activity', activityRouter);
app.use('/api/saved-businesses', savedBusinessRouter);
app.use('/api/seller/customers', sellerCustomerRouter);

// Error handling
app.use(errorHandler);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Auth Routes: /api/auth/*`);
  console.log(`👑 Admin Routes: /api/admin/*`);
  console.log(`🏪 Business Routes: /api/businesses/*`);
  console.log(`📅 Booking Routes: /api/bookings/*`);
  console.log(`💰 Settlement Routes: /api/settlements/*`);
  console.log(`🔔 Notification Routes: /api/notifications/*`);
  console.log(`📈 Analytics Routes: /api/analytics/*`);
  console.log(`⚙️ Settings Routes: /api/settings/*`);
  console.log(`🌐 Website Routes: /api/website/*`);
  console.log(`👤 User Routes: /api/users/*`);
  console.log(`📝 Review Routes: /api/reviews/*`);
  console.log(`🔍 Search Routes: /api/search/*`);
  console.log(`💸 Finance Routes: /api/finances/*`);
  console.log(`🤝 CRM Routes: /api/crm/*`);
  console.log(`📁 Upload Routes: /api/upload/*`);
  console.log(`👥 Seller Customer Routes: /api/seller/customers/*`);
});