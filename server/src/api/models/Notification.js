import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['business', 'booking', 'payment', 'system', 'review'],
    required: true,
  },
  message: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedId: mongoose.Schema.Types.ObjectId,
}, {
  timestamps: true,
});

export const Notification = mongoose.model('Notification', notificationSchema);