import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'closed'],
    default: 'pending',
  },
  responses: [{
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['seller', 'customer'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  tags: [String],
}, {
  timestamps: true,
});

// Index for efficient queries
inquirySchema.index({ businessId: 1, status: 1 });
inquirySchema.index({ customerId: 1 });
inquirySchema.index({ createdAt: -1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);