import { SavedBusiness, Business, User } from '../models/index.js';

export const SavedBusinessService = {
  async getSavedBusinesses(userId, options = {}) {
    const { category, search, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    try {
      // Build query for saved businesses
      let query = { customerId: userId };

      // Build business population pipeline for filtering
      let businessMatch = {};
      
      if (category && category !== 'all') {
        businessMatch.category = category;
      }
      
      if (search) {
        businessMatch.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }

      // Get saved businesses with populated business data
      const savedBusinesses = await SavedBusiness.find(query)
        .populate({
          path: 'businessId',
          select: 'name description category address phone email rating reviewCount images services businessHours status',
          match: businessMatch.length > 0 ? businessMatch : {}
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Filter out null businesses (in case business was deleted)
      const validSavedBusinesses = savedBusinesses.filter(saved => saved.businessId);

      // Transform data to match frontend expectations
      const transformedBusinesses = validSavedBusinesses.map(saved => ({
        id: saved._id,
        business: saved.businessId.name,
        category: saved.businessId.category,
        location: this.formatAddress(saved.businessId.address),
        phone: saved.businessId.phone,
        rating: saved.businessId.rating || 0,
        reviewCount: saved.businessId.reviewCount || 0,
        savedDate: saved.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        image: saved.businessId.images?.[0] || null,
        speciality: saved.businessId.services?.[0] || 'Service Provider',
        description: saved.businessId.description || 'No description available',
        services: saved.businessId.services || [],
        isOpen: this.checkIfBusinessOpen(saved.businessId.businessHours),
        openTime: this.formatBusinessHours(saved.businessId.businessHours),
        notes: saved.notes,
        tags: saved.tags,
        businessData: {
          id: saved.businessId._id,
          status: saved.businessId.status,
          email: saved.businessId.email,
          address: saved.businessId.address
        }
      }));

      // Get total count for pagination
      const totalSaved = await SavedBusiness.countDocuments(query);

      // Get category stats
      const categoryStats = await this.getCategoryStats(userId);

      return {
        savedBusinesses: transformedBusinesses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalSaved / limit),
          totalItems: totalSaved,
          itemsPerPage: limit
        },
        categories: categoryStats,
        filters: {
          currentCategory: category || 'all',
          currentSearch: search || ''
        }
      };

    } catch (error) {
      console.error('Get saved businesses error:', error);
      throw new Error('Failed to retrieve saved businesses');
    }
  },

  async saveBusiness(userId, businessId, options = {}) {
    const { notes = '', tags = [] } = options;

    try {
      // Check if business exists
      const business = await Business.findById(businessId);
      if (!business) {
        throw new Error('Business not found');
      }

      // Check if already saved
      const existingSaved = await SavedBusiness.findOne({
        customerId: userId,
        businessId: businessId
      });

      if (existingSaved) {
        throw new Error('Business is already saved');
      }

      // Create new saved business record
      const savedBusiness = new SavedBusiness({
        customerId: userId,
        businessId: businessId,
        notes,
        tags
      });

      await savedBusiness.save();

      // Populate business data for response
      await savedBusiness.populate({
        path: 'businessId',
        select: 'name description category address phone email rating reviewCount images services'
      });

      return {
        id: savedBusiness._id,
        business: savedBusiness.businessId,
        savedAt: savedBusiness.createdAt,
        notes: savedBusiness.notes,
        tags: savedBusiness.tags
      };

    } catch (error) {
      console.error('Save business error:', error);
      throw error;
    }
  },

  async unsaveBusiness(userId, businessId) {
    try {
      const result = await SavedBusiness.findOneAndDelete({
        customerId: userId,
        businessId: businessId
      });

      if (!result) {
        throw new Error('Saved business not found');
      }

      return true;
    } catch (error) {
      console.error('Unsave business error:', error);
      throw error;
    }
  },

  async checkIfBusinessSaved(userId, businessId) {
    try {
      const saved = await SavedBusiness.findOne({
        customerId: userId,
        businessId: businessId
      });

      return !!saved;
    } catch (error) {
      console.error('Check business saved error:', error);
      throw error;
    }
  },

  async getCategoryStats(userId) {
    try {
      const stats = await SavedBusiness.aggregate([
        { $match: { customerId: userId } },
        {
          $lookup: {
            from: 'businesses',
            localField: 'businessId',
            foreignField: '_id',
            as: 'business'
          }
        },
        { $unwind: '$business' },
        {
          $group: {
            _id: '$business.category',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);

      return [
        { id: 'all', label: 'All Categories', count: totalCount },
        ...stats.map(stat => ({
          id: stat._id,
          label: stat._id,
          count: stat.count
        }))
      ];
    } catch (error) {
      console.error('Get category stats error:', error);
      return [{ id: 'all', label: 'All Categories', count: 0 }];
    }
  },

  formatAddress(address) {
    if (!address) return 'Location not specified';
    
    const parts = [];
    if (address.area) parts.push(address.area);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  },

  checkIfBusinessOpen(businessHours) {
    if (!businessHours || !businessHours.length) return false;
    
    const now = new Date();
    const currentDay = now.toLocaleLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const todayHours = businessHours.find(hours => 
      hours.day.toLowerCase() === currentDay
    );
    
    if (!todayHours || !todayHours.isOpen) return false;
    
    const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  },

  formatBusinessHours(businessHours) {
    if (!businessHours || !businessHours.length) return 'Hours not specified';
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const todayHours = businessHours.find(hours => 
      hours.day.toLowerCase() === currentDay
    );
    
    if (!todayHours) return 'Hours not specified';
    if (!todayHours.isOpen) return 'Closed today';
    
    return `${todayHours.openTime} - ${todayHours.closeTime}`;
  }
};