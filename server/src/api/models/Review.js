import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  isFlagged: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const Review = mongoose.model('Review', reviewSchema);