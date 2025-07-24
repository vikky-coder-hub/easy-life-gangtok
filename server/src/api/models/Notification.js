import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'inquiry', 'system', 'business', 'urgent', 'warning', 'success', 'info'],
    required: true,
  },
  category: {
    type: String,
    enum: ['security', 'financial', 'business', 'content', 'system', 'users'],
    default: 'system',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  actionRequired: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Business', 'User', 'Review', 'Transaction'],
  },
  amount: {
    type: Number,
  },
  customer: {
    type: String,
  },
  source: {
    type: String,
    default: 'System',
  },
  actions: [{
    type: String,
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Index for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);