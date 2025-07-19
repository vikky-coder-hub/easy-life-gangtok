import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: String,
  description: String,
  tags: [String],
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  contact: {
    phone: String,
    email: String,
    website: String,
  },
  businessHours: {
    monday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    tuesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    wednesday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    thursday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    friday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    saturday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
    sunday: {
      open: String,
      close: String,
      isOpen: { type: Boolean, default: true },
    },
  },
  services: [String],
  pricing: String,
  images: [{
    url: String,
    publicId: String,
  }],
  documents: [{
    name: String,
    url: String,
    publicId: String,
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'banned'],
    default: 'pending',
  },
  submittedDate: Date,
  reviewStartDate: Date,
  approvalDate: Date,
  rating: Number,
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    date: Date,
    isFlagged: { type: Boolean, default: false },
  }],
}, {
  timestamps: true,
});

export const Business = mongoose.model('Business', businessSchema);