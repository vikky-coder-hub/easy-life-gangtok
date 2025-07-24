import { Booking, Business, Notification, Settlement } from '../models/index.js';

export const BookingService = {
  async create(data, user) {
    const business = await Business.findById(data.businessId);
    if (!business || business.status !== 'approved') throw new Error('Invalid or unapproved business');

    const commissionRate = 0.15; // 15%
    const commission = data.amount * commissionRate;

    const booking = new Booking({
      ...data,
      customerId: user.userId,
      bookingDate: new Date(),
      commission,
    });
    await booking.save();

    await Notification.create({
      userId: business.userId,
      type: 'booking',
      message: `New booking for ${business.name}`,
      relatedId: booking._id,
    });

    return booking;
  },

  async getAll({ status, search, page, limit }, user) {
    const query = user.userType === 'admin' ? {} : { customerId: user.userId };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { service: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    const bookings = await Booking.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('businessId customerId', 'name email phone');
    
    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      id: booking._id,
      seller: booking.businessId,
      customer: booking.customerId,
      eventDate: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '',
      bookingDate: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : ''
    }));
    
    const total = await Booking.countDocuments(query);
    return { bookings: transformedBookings, total, page, limit };
  },

  async getById(id) {
    const booking = await Booking.findById(id).populate('businessId customerId', 'name email phone');
    if (!booking) throw new Error('Booking not found');
    
    // Transform data to match frontend expectations
    return {
      ...booking.toObject(),
      id: booking._id,
      seller: booking.businessId,
      customer: booking.customerId,
      eventDate: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '',
      bookingDate: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : ''
    };
  },

  async getCustomerBookings(customerId, user) {
    // Ensure the user can only access their own bookings unless they're admin
    if (user.userType !== 'admin' && user.userId !== customerId) {
      throw new Error('Unauthorized');
    }

    const bookings = await Booking.find({ customerId })
      .populate('businessId', 'name email phone profileImage')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    return bookings;
  },

  async updateStatus(id, status, cancellationReason, user) {
    const booking = await Booking.findById(id);
    if (!booking) throw new Error('Booking not found');
    if (user.userType !== 'admin' && booking.customerId.toString() !== user.userId) {
      throw new Error('Unauthorized');
    }

    booking.status = status;
    if (status === 'cancelled') booking.cancellationReason = cancellationReason;
    if (status === 'completed' && booking.paymentStatus === 'paid') {
      const business = await Business.findById(booking.businessId);
      await Settlement.create({
        businessId: booking.businessId,
        bookingId: booking._id,
        sellerId: business.userId,
        customerId: booking.customerId,
        service: booking.service,
        transactionDate: new Date(),
        settlementDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // T+4
        grossAmount: booking.amount,
        commissionAmount: booking.commission,
        netAmount: booking.amount - booking.commission,
        paymentId: booking.paymentId,
      });
    }
    await booking.save();

    await Notification.create({
      userId: booking.customerId,
      type: 'booking',
      message: `Booking ${booking._id} ${status}`,
      relatedId: booking._id,
    });

    return booking;
  },
};