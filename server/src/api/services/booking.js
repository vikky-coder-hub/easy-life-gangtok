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

  async getSellerBookings(sellerId, user) {
    // Ensure the user can only access their own business bookings unless they're admin
    if (user.userType !== 'admin' && user.userId !== sellerId) {
      throw new Error('Unauthorized');
    }

    // First find the business owned by this seller
    const business = await Business.findOne({ userId: sellerId });
    if (!business) {
      // Return empty array if no business found
      return [];
    }

    const bookings = await Booking.find({ businessId: business._id })
      .populate('customerId', 'name email phone profileImage')
      .populate('businessId', 'name email phone')
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      id: booking._id,
      customer: {
        name: booking.customerId.name,
        email: booking.customerId.email,
        phone: booking.customerId.phone,
      },
      eventDate: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '',
      eventTime: booking.eventTime || '',
      orderDate: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : '',
      platformFee: booking.commission || 0,
      netAmount: booking.amount ? (booking.amount - (booking.commission || 0)) : 0,
      priority: booking.priority || 'medium',
      serviceType: booking.serviceType || booking.service,
      estimatedDuration: booking.estimatedDuration || '2-4 hours',
      requiresApproval: booking.requiresApproval !== false,
      notifications: [],
      customerName: booking.customerId.name,
      specialRequests: booking.specialRequests || 'No special requests',
      description: booking.description || `${booking.service} service requested`,
      customerRating: booking.customerRating || null,
      customerReview: booking.customerReview || null,
      cancellationReason: booking.cancellationReason || null,
    }));

    return transformedBookings;
  },

  async getSellerOrderStats(sellerId, user) {
    // Ensure the user can only access their own business stats unless they're admin
    if (user.userType !== 'admin' && user.userId !== sellerId) {
      throw new Error('Unauthorized');
    }

    // First find the business owned by this seller
    const business = await Business.findOne({ userId: sellerId });
    if (!business) {
      // Return empty stats if no business found
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
        totalRevenue: 0,
        totalEarnings: 0,
        platformFees: 0,
      };
    }

    // Get all bookings for this business
    const bookings = await Booking.find({ businessId: business._id });

    // Calculate statistics
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      inProgress: bookings.filter(b => b.status === 'in-progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0),
      totalEarnings: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + ((b.amount || 0) - (b.commission || 0)), 0),
      platformFees: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.commission || 0), 0),
    };

    return stats;
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