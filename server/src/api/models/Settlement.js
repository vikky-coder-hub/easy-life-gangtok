import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: String,
  transactionDate: Date,
  settlementDate: Date,
  grossAmount: Number,
  commissionAmount: Number,
  netAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed'],
    default: 'pending',
  },
  paymentId: String,
}, {
  timestamps: true,
});

export const Settlement = mongoose.model('Settlement', settlementSchema);