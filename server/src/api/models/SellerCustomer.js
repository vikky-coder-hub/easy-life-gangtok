import mongoose from 'mongoose';

// Enhanced customer note schema for seller CRM
const sellerCustomerNoteSchema = new mongoose.Schema({
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
  note: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['general', 'preference', 'follow-up', 'issue', 'feedback'],
    default: 'general',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [String],
}, {
  timestamps: true,
});

// Customer relationship tracking for sellers
const customerRelationshipSchema = new mongoose.Schema({
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
  segment: {
    type: String,
    enum: ['new', 'regular', 'vip', 'inactive'],
    default: 'new',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  preferences: [{
    type: String,
    trim: true,
  }],
  totalBookings: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  lastBookingDate: Date,
  lastInteractionDate: Date,
  communicationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: Boolean,
      default: true,
    },
    whatsapp: {
      type: Boolean,
      default: false,
    },
  },
  followUpDate: Date,
  followUpReason: String,
  lifetime_value: {
    type: Number,
    default: 0,
  },
  acquisition_source: String,
  tags: [String],
}, {
  timestamps: true,
});

// Customer communication tracking
const customerCommunicationSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['booking', 'inquiry', 'review', 'support', 'follow-up', 'message'],
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Review', 'Inquiry'],
  },
  content: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'responded', 'closed'],
    default: 'pending',
  },
  channel: {
    type: String,
    enum: ['phone', 'email', 'whatsapp', 'sms', 'in-person', 'app'],
    default: 'app',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Add indexes for performance
sellerCustomerNoteSchema.index({ businessId: 1, customerId: 1, createdAt: -1 });
customerRelationshipSchema.index({ businessId: 1, customerId: 1 }, { unique: true });
customerRelationshipSchema.index({ businessId: 1, segment: 1, status: 1 });
customerCommunicationSchema.index({ businessId: 1, customerId: 1, createdAt: -1 });
customerCommunicationSchema.index({ businessId: 1, type: 1, status: 1 });

export const SellerCustomerNote = mongoose.model('SellerCustomerNote', sellerCustomerNoteSchema);
export const CustomerRelationship = mongoose.model('CustomerRelationship', customerRelationshipSchema);
export const CustomerCommunication = mongoose.model('CustomerCommunication', customerCommunicationSchema);
