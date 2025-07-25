import { Review, Business, Notification } from '../models/index.js';
import { NotFoundError, UnauthorizedError } from '../middlewares/error.js';

export const ReviewService = {
  async create(data, user) {
    const business = await Business.findById(data.businessId);
    if (!business || business.status !== 'approved') throw new NotFoundError('Invalid or unapproved business');

    const review = new Review({
      ...data,
      userId: user.userId,
      date: new Date(),
    });
    await review.save();

    // Update business rating
    const reviews = await Review.find({ businessId: data.businessId });
    business.rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await business.save();

    await Notification.create({
      userId: business.userId,
      type: 'review',
      message: `New review added for ${business.name}`,
      relatedId: review._id,
    });

    return review;
  },

  async getAll({ businessId, page = 1, limit = 10 }) {
    const query = businessId ? { businessId } : {};
    const reviews = await Review.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name');
    const total = await Review.countDocuments(query);
    return { reviews, total, page, limit };
  },

  async getSellerReviews(sellerId, { page = 1, limit = 10, rating = null }) {
    // Find the business owned by this seller
    const business = await Business.findOne({ userId: sellerId });
    if (!business) {
      return { reviews: [], total: 0, page, limit };
    }

    // Build query
    const query = { businessId: business._id };
    if (rating) {
      query.rating = rating;
    }

    const reviews = await Review.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('businessId', 'name')
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedReviews = reviews.map(review => ({
      id: review._id,
      customerName: review.userId?.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment || '',
      date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) : '',
      timestamp: review.createdAt ? new Date(review.createdAt).toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : '',
      verified: true, // Assuming all reviews are verified
      helpful: 0, // This would need to be implemented separately
      replied: false, // This would need to be implemented separately
      replyText: null,
      photos: [], // This would need to be implemented separately
      isFlagged: review.isFlagged || false,
      serviceName: review.businessId?.name || 'Service',
    }));

    const total = await Review.countDocuments(query);
    return { reviews: transformedReviews, total, page, limit };
  },

  async update(id, data, user) {
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review not found');
    if (review.userId.toString() !== user.userId) throw new UnauthorizedError('Unauthorized');

    Object.assign(review, data);
    await review.save();

    // Update business rating
    const reviews = await Review.find({ businessId: review.businessId });
    const business = await Business.findById(review.businessId);
    business.rating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await business.save();

    return review;
  },

  async delete(id, user) {
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review not found');
    if (review.userId.toString() !== user.userId && user.userType !== 'admin') throw new UnauthorizedError('Unauthorized');

    await review.deleteOne();

    // Update business rating
    const reviews = await Review.find({ businessId: review.businessId });
    const business = await Business.findById(review.businessId);
    business.rating = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    await business.save();
  },

  async flagReview(id, isFlagged) {
    const review = await Review.findById(id);
    if (!review) throw new NotFoundError('Review not found');
    review.isFlagged = isFlagged;
    await review.save();

    await Notification.create({
      userId: review.userId,
      type: 'review',
      message: `Your review has been ${isFlagged ? 'flagged for moderation' : 'approved'}`,
      relatedId: review._id,
    });

    return review;
  },
};