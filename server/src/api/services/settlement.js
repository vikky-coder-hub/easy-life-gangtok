import { Settlement, Booking } from '../models/index.js';

export const SettlementService = {
  async getAll({ status, dateRange, search, page, limit }) {
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { service: { $regex: search, $options: 'i' } },
        { paymentId: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateRange) {
      const now = new Date();
      let startDate;
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      if (startDate) query.transactionDate = { $gte: startDate };
    }
    const settlements = await Settlement.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('businessId sellerId customerId', 'name email phone');
    const total = await Settlement.countDocuments(query);
    return { settlements, total, page, limit };
  },

  async updateStatus(id, status) {
    const settlement = await Settlement.findById(id);
    if (!settlement) throw new Error('Settlement not found');
    settlement.status = status;
    await settlement.save();
    return settlement;
  },
};