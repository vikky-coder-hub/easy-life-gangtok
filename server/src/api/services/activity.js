import { User, Business, Booking, Review, SavedBusiness, Notification } from '../models/index.js';

export const activityService = {
  async getCustomerActivity(userId, options = {}) {
    const { type, limit = 20, page = 1 } = options;
    const skip = (page - 1) * limit;

    try {
      // Verify customer exists
      const customer = await User.findById(userId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      let activities = [];

      // Get bookings activity
      if (!type || type === 'booking') {
        const bookings = await Booking.find({ customerId: userId })
          .populate({
            path: 'businessId',
            select: 'name category address images phone email'
          })
          .sort({ createdAt: -1 })
          .limit(type ? limit : 50); // Get more if not filtering by type

        const bookingActivities = bookings.map(booking => ({
          id: booking._id,
          type: 'booking',
          business: booking.businessId?.name || 'Unknown Business',
          businessImage: booking.businessId?.images?.[0] || null,
          action: `Booked ${booking.service || 'service'}`,
          date: booking.createdAt,
          category: booking.businessId?.category || 'Service',
          location: booking.businessId?.address?.area || booking.businessId?.address?.city || 'Unknown Location',
          status: booking.status,
          bookingDetails: {
            service: booking.service,
            scheduledDate: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'TBD',
            time: booking.eventTime || 'TBD',
            bookingId: `#BK${booking._id.toString().slice(-6).toUpperCase()}`,
            amount: booking.amount
          },
          businessData: {
            id: booking.businessId?._id,
            phone: booking.businessId?.phone,
            email: booking.businessId?.email
          }
        }));

        activities.push(...bookingActivities);
      }

      // Get reviews activity
      if (!type || type === 'review') {
        const reviews = await Review.find({ userId: userId })
          .populate({
            path: 'businessId',
            select: 'name category address images'
          })
          .sort({ createdAt: -1 })
          .limit(type ? limit : 50);

        const reviewActivities = reviews.map(review => ({
          id: review._id,
          type: 'review',
          business: review.businessId?.name || 'Unknown Business',
          businessImage: review.businessId?.images?.[0] || null,
          action: 'Left a review',
          date: review.createdAt,
          category: review.businessId?.category || 'Service',
          location: review.businessId?.address?.area || review.businessId?.address?.city || 'Unknown Location',
          rating: review.rating,
          reviewText: review.comment || 'No comment provided',
          businessData: {
            id: review.businessId?._id
          }
        }));

        activities.push(...reviewActivities);
      }

      // Get saved businesses activity
      if (!type || type === 'save') {
        const savedBusinesses = await SavedBusiness.find({ customerId: userId })
          .populate({
            path: 'businessId',
            select: 'name category address images'
          })
          .sort({ createdAt: -1 })
          .limit(type ? limit : 50);

        const saveActivities = savedBusinesses.map(saved => ({
          id: saved._id,
          type: 'save',
          business: saved.businessId?.name || 'Unknown Business',
          businessImage: saved.businessId?.images?.[0] || null,
          action: 'Saved business',
          date: saved.createdAt,
          category: saved.businessId?.category || 'Service',
          location: saved.businessId?.address?.area || saved.businessId?.address?.city || 'Unknown Location',
          businessData: {
            id: saved.businessId?._id
          }
        }));

        activities.push(...saveActivities);
      }

      // Get inquiry/notification activity (inquiries can be represented as notifications)
      if (!type || type === 'inquiry') {
        const inquiries = await Notification.find({ 
          userId: userId,
          type: { $in: ['inquiry_sent', 'inquiry_response', 'business_inquiry'] }
        })
          .sort({ createdAt: -1 })
          .limit(type ? limit : 30);

        const inquiryActivities = inquiries.map(inquiry => {
          // Extract business name from title or message
          const businessName = this.extractBusinessNameFromNotification(inquiry);
          
          return {
            id: inquiry._id,
            type: 'inquiry',
            business: businessName,
            businessImage: null, // Notifications don't have business images
            action: 'Sent inquiry',
            date: inquiry.createdAt,
            category: 'Inquiry',
            location: 'Unknown Location',
            status: inquiry.isRead ? 'responded' : 'pending',
            inquiryText: inquiry.message || 'Inquiry sent to business',
            businessData: {
              id: null // We don't have business ID in notifications
            }
          };
        });

        activities.push(...inquiryActivities);
      }

      // Sort all activities by date (newest first)
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Apply pagination
      const totalActivities = activities.length;
      const paginatedActivities = activities.slice(skip, skip + limit);

      // Get summary stats
      const stats = await this.getActivityStats(userId);

      return {
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalActivities / limit),
          totalItems: totalActivities,
          itemsPerPage: limit
        },
        stats,
        filters: {
          availableTypes: ['all', 'booking', 'review', 'save', 'inquiry'],
          currentType: type || 'all'
        }
      };

    } catch (error) {
      console.error('Activity service error:', error);
      throw new Error('Failed to retrieve customer activity');
    }
  },

  async getActivityStats(userId) {
    try {
      const [bookingsCount, reviewsCount, savedCount] = await Promise.all([
        Booking.countDocuments({ customerId: userId }),
        Review.countDocuments({ userId: userId }),
        SavedBusiness.countDocuments({ customerId: userId })
      ]);

      // Get inquiry count from notifications
      const inquiriesCount = await Notification.countDocuments({
        userId: userId,
        type: { $in: ['inquiry_sent', 'inquiry_response', 'business_inquiry'] }
      });

      return {
        totalBookings: bookingsCount,
        totalReviews: reviewsCount,
        totalSaved: savedCount,
        totalInquiries: inquiriesCount,
        totalActivities: bookingsCount + reviewsCount + savedCount + inquiriesCount
      };
    } catch (error) {
      console.error('Activity stats error:', error);
      return {
        totalBookings: 0,
        totalReviews: 0,
        totalSaved: 0,
        totalInquiries: 0,
        totalActivities: 0
      };
    }
  },

  extractBusinessNameFromNotification(notification) {
    // Try to extract business name from notification title or message
    if (notification.title && notification.title.includes('inquiry')) {
      // Look for patterns like "Inquiry sent to Business Name"
      const match = notification.title.match(/inquiry.*?to\s+(.+)/i);
      if (match) return match[1];
    }
    
    if (notification.message) {
      // Look for business mentions in message
      const match = notification.message.match(/business[:\s]+(.+)/i);
      if (match) return match[1];
    }

    return 'Unknown Business';
  }
};
