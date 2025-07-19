import mongoose from 'mongoose';

const savedBusinessSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Create compound index to ensure a customer can only save a business once
savedBusinessSchema.index({ customerId: 1, businessId: 1 }, { unique: true });

export const SavedBusiness = mongoose.model('SavedBusiness', savedBusinessSchema);
