import { User, Lead, CustomerNote } from '../models/index.js';
import { NotFoundError } from '../middlewares/error.js';

export const CRMService = {
  async getCustomers({ search, page = 1, limit = 10 }) {
    const query = { userType: 'customer' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const customers = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password -currentOTP');
    const total = await User.countDocuments(query);
    return { customers, total, page, limit };
  },

  async getLeads({ status, page = 1, limit = 10 }) {
    const query = status ? { status } : {};
    const leads = await Lead.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Lead.countDocuments(query);
    return { leads, total, page, limit };
  },

  async addCustomerNote(userId, note, admin) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    const customerNote = new CustomerNote({
      userId,
      note,
      createdBy: admin.userId,
    });
    await customerNote.save();
    return customerNote;
  },
};