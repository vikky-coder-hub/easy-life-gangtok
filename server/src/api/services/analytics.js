import { User, Business, Booking, Review, SavedBusiness } from '../models/index.js';

export const AnalyticsService = {
  async getReports(period) {
    const now = new Date();
    let startDate;
    switch (period) {
      case 'last7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'last90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case 'lastyear':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const users = await User.find({ createdAt: { $gte: startDate } });
    const businesses = await Business.find({ createdAt: { $gte: startDate } });
    const bookings = await Booking.find({ bookingDate: { $gte: startDate } });

    const overview = {
      totalUsers: users.length,
      totalBusinesses: businesses.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.amount : 0), 0),
      pageViews: Math.floor(Math.random() * 100000), // Placeholder
      userGrowth: 12.5, // Placeholder
      businessGrowth: 8.3, // Placeholder
      revenueGrowth: 15.7, // Placeholder
      viewsGrowth: 23.1, // Placeholder
    };

    const userActivity = [];
    const days = period === 'last7days' ? 7 : 30;
    for (let i = 0; i < days; i++) {
      const date = new Date(now.setDate(now.getDate() - i));
      userActivity.push({
        date: date.toISOString().split('T')[0],
        users: users.filter(u => u.createdAt.toISOString().split('T')[0] === date.toISOString().split('T')[0]).length,
        businesses: businesses.filter(b => b.createdAt.toISOString().split('T')[0] === date.toISOString().split('T')[0]).length,
      });
    }

    const topBusinesses = await Business.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('name rating');

    const categories = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, percentage: { $multiply: [{ $divide: ['$count', await Business.countDocuments()] }, 100] } } },
    ]);

    return { overview, userActivity, topBusinesses, categories };
  },

  async getCustomerDashboard(userId) {
    // Get customer's saved businesses, bookings, and activity
    const customer = await User.findById(userId);
    if (!customer) throw new Error('Customer not found');

    // Get customer's bookings
    const bookings = await Booking.find({ customerId: userId })
      .populate('businessId', 'name category images')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get customer's saved businesses count
    const savedBusinessesCount = await SavedBusiness.countDocuments({ userId: userId });

    // Get customer's actual saved businesses (latest 5)
    const savedBusinesses = await SavedBusiness.find({ userId: userId })
      .populate({
        path: 'businessId',
        select: 'name description category address phone email rating reviewCount images services'
      })
      .sort({ savedAt: -1 })
      .limit(5);

    // Get customer's reviews count
    const reviewsCount = await Review.countDocuments({ userId: userId });

    // Calculate total spent
    const totalSpent = await Booking.aggregate([
      { $match: { customerId: userId, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const stats = {
      savedBusinesses: savedBusinessesCount,
      totalBookings: bookings.length,
      reviews: reviewsCount,
      totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0
    };

    return {
      stats,
      recentBookings: bookings,
      savedBusinesses: savedBusinesses.filter(saved => saved.businessId), // Filter out null businesses
      recentActivity: this.generateCustomerActivity(bookings)
    };
  },

  async getSellerDashboard(userId) {
    // Get seller's business
    const business = await Business.findOne({ userId: userId });
    if (!business) throw new Error('Business not found');

    // Get business bookings
    const bookings = await Booking.find({ businessId: business._id })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate earnings
    const totalEarnings = await Booking.aggregate([
      { $match: { businessId: business._id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$amount', '$commission'] } } } }
    ]);

    // Get booking stats by status
    const bookingStats = await Booking.aggregate([
      { $match: { businessId: business._id } },
      { $group: { 
        _id: '$status',
        count: { $sum: 1 },
        revenue: { $sum: '$amount' }
      }}
    ]);

    // Process booking stats
    const statsMap = bookingStats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, revenue: stat.revenue };
      return acc;
    }, {});

    // Get business views (mock data for now - you'd track this in a separate collection)
    const businessViews = Math.floor(Math.random() * 1000) + 500;

    // Get pending inquiries count
    const pendingInquiries = statsMap.pending?.count || 0;

    // Get reviews for this business
    const reviews = await Review.find({ businessId: business._id }).sort({ createdAt: -1 }).limit(5);
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

    const stats = {
      totalBookings: bookings.length,
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
      businessViews: businessViews,
      pendingInquiries: pendingInquiries,
      confirmedBookings: statsMap.confirmed?.count || 0,
      cancelledBookings: statsMap.cancelled?.count || 0,
      rating: averageRating || business.rating || 4.5,
      totalRevenue: Object.values(statsMap).reduce((sum, stat) => sum + stat.revenue, 0)
    };

    return {
      stats,
      recentBookings: bookings,
      businessInfo: business,
      recentReviews: reviews,
      bookingsByStatus: statsMap
    };
  },

  async getAdminDashboard() {
    // Get platform-wide statistics
    const totalUsers = await User.countDocuments();
    const totalBusinesses = await Business.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Calculate revenue and commission
    const revenueStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { 
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalCommission: { $sum: '$commission' }
      }}
    ]);

    // Get user type breakdown
    const userBreakdown = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    // Get recent activities (bookings)
    const recentActivities = await Booking.find()
      .populate('customerId', 'name email')
      .populate('businessId', 'name category')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get business category breakdown
    const categoryBreakdown = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Get monthly booking trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get booking status breakdown
    const bookingStatusBreakdown = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get top-performing businesses
    const topBusinesses = await Booking.aggregate([
      { $group: {
        _id: '$businessId',
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$amount' }
      }},
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'businesses',
        localField: '_id',
        foreignField: '_id',
        as: 'business'
      }},
      { $unwind: '$business' },
      { $project: {
        businessName: '$business.name',
        category: '$business.category',
        totalBookings: 1,
        totalRevenue: 1,
        rating: '$business.rating'
      }}
    ]);

    // Get recent reviews
    const recentReviews = await Review.find()
      .populate('userId', 'name')
      .populate('businessId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent business registrations
    const recentBusinesses = await Business.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('name email userType createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Process user breakdown
    const userStats = userBreakdown.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Process booking status breakdown
    const statusStats = bookingStatusBreakdown.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const stats = {
      totalUsers,
      totalBusinesses,
      totalBookings,
      totalReviews,
      totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
      totalCommission: revenueStats.length > 0 ? revenueStats[0].totalCommission : 0,
      customers: userStats.customer || 0,
      sellers: userStats.seller || 0,
      admins: userStats.admin || 0,
      pendingBookings: statusStats.pending || 0,
      confirmedBookings: statusStats.confirmed || 0,
      completedBookings: statusStats.completed || 0,
      cancelledBookings: statusStats.cancelled || 0
    };

    return {
      stats,
      recentActivities,
      categoryBreakdown,
      monthlyBookings,
      topBusinesses,
      recentReviews,
      recentBusinesses,
      recentUsers,
      userBreakdown: userStats,
      bookingStatusBreakdown: statusStats
    };
  },

  generateCustomerActivity(bookings) {
    // Generate activity feed based on bookings
    return bookings.map(booking => ({
      id: booking._id,
      type: 'booking',
      business: booking.businessId?.name || 'Unknown Business',
      action: `Booked ${booking.service}`,
      date: booking.createdAt,
      status: booking.status
    }));
  },
};