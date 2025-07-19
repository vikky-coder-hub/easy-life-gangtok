import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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
  service: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  bookingDate: Date,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  amount: Number,
  commission: Number,
  guestCount: Number,
  specialRequests: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentId: String,
  cancellationReason: String,
}, {
  timestamps: true,
});

export const Booking = mongoose.model('Booking', bookingSchema);