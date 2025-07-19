import { User, Business, Notification } from '../models/index.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import { NotFoundError, UnauthorizedError } from '../middlewares/error.js';

export const UserService = {
  async getAll({ search, page = 1, limit = 10 }) {
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-password -currentOTP');
    const total = await User.countDocuments(query);
    return { users, total, page, limit };
  },

  async getBanned() {
    const users = await User.find({ isBanned: true }).select('-password -currentOTP');
    return { users, total: users.length };
  },

  async getById(id, user) {
    const targetUser = await User.findById(id).select('-password -currentOTP');
    if (!targetUser) throw new NotFoundError('User not found');
    if (user.userType !== 'admin' && user.userId !== id) throw new UnauthorizedError('Unauthorized');
    return targetUser;
  },

  async update(id, data, file, user) {
    const targetUser = await User.findById(id);
    if (!targetUser) throw new NotFoundError('User not found');
    if (user.userType !== 'admin' && user.userId !== id) throw new UnauthorizedError('Unauthorized');

    if (file) {
      if (targetUser.profile.avatarPublicId) await deleteImage(targetUser.profile.avatarPublicId);
      const { url, publicId } = await uploadImage(file, 'user_avatars');
      targetUser.profile.avatar = url;
      targetUser.profile.avatarPublicId = publicId;
    }

    if (data.password) {
      targetUser.password = await hashPassword(data.password);
    }
    Object.assign(targetUser, { ...data, password: undefined });
    await targetUser.save();
    return targetUser;
  },

  async banUser(id, isBanned, user) {
    if (user.userType !== 'admin') throw new UnauthorizedError('Only admins can ban users');
    const targetUser = await User.findById(id);
    if (!targetUser) throw new NotFoundError('User not found');
    targetUser.isBanned = isBanned;
    await targetUser.save();

    await Notification.create({
      userId: id,
      type: 'system',
      message: `Your account has been ${isBanned ? 'banned' : 'unbanned'}`,
      relatedId: id,
    });

    if (isBanned) {
      await Business.updateMany({ userId: id }, { status: 'banned' });
    }
    return targetUser;
  },

  async delete(id) {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User not found');
    if (user.profile.avatarPublicId) await deleteImage(user.profile.avatarPublicId);
    if (user.businessInfo.businessLicensePublicId) await deleteImage(user.businessInfo.businessLicensePublicId);
    await user.deleteOne();
  },
};