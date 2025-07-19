import { Booking, Settlement, Transaction } from '../models/index.js';
import { NotFoundError } from '../middlewares/error.js';

export const FinanceService = {
  async getDashboard(period) {
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

    const bookings = await Booking.find({ bookingDate: { $gte: startDate } });
    const settlements = await Settlement.find({ transactionDate: { $gte: startDate } });
    const transactions = await Transaction.find({ createdAt: { $gte: startDate } });

    return {
      totalRevenue: bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.amount : 0), 0),
      totalCommission: bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? b.commission : 0), 0),
      pendingSettlements: settlements.filter(s => s.status === 'pending').length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
    };
  },

  async getPendingSettlements({ page = 1, limit = 10 }) {
    const settlements = await Settlement.find({ status: 'pending' })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('businessId sellerId customerId', 'name email phone');
    const total = await Settlement.countDocuments({ status: 'pending' });
    return { settlements, total, page, limit };
  },

  async processSettlements(settlementIds) {
    const settlements = await Settlement.find({ _id: { $in: settlementIds } });
    for (const settlement of settlements) {
      settlement.status = 'completed';
      await settlement.save();
    }
    return settlements;
  },
};