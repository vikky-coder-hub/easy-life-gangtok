import { Business, Booking } from '../models/index.js';
import { NotFoundError } from '../middlewares/error.js';

export const SearchService = {
  async searchBusinesses({ query, category, page = 1, limit = 10 }) {
    const searchQuery = { status: 'approved' };
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { subcategory: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }
    if (category) {
      searchQuery.category = category;
    }
    const businesses = await Business.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('category', 'name');
    const total = await Business.countDocuments(searchQuery);
    return { businesses, total, page, limit };
  },

  async searchServices({ query, page = 1, limit = 10 }) {
    const searchQuery = {};
    if (query) {
      searchQuery.service = { $regex: query, $options: 'i' };
    }
    const bookings = await Booking.find(searchQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('businessId', 'name');
    const total = await Booking.countDocuments(searchQuery);
    return { services: bookings, total, page, limit };
  },

  async getSuggestions(query) {
    if (!query) return [];
    const suggestions = await Business.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { subcategory: { $regex: query, $options: 'i' } },
      ],
      status: 'approved',
    })
      .limit(5)
      .select('name subcategory');
    return suggestions.map(b => ({ name: b.name, subcategory: b.subcategory }));
  },
};