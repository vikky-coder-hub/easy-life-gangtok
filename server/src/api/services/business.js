import { Business, Notification, Category } from '../models/index.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';
import { NotFoundError, UnauthorizedError } from '../middlewares/error.js';

export const BusinessService = {
  async create(data, files, user) {
    console.log('=== BUSINESS SERVICE CREATE DEBUG ===');
    console.log('User type:', user.userType);
    console.log('Data received:', JSON.stringify(data, null, 2));
    
    if (user.userType !== 'seller') throw new UnauthorizedError('Only sellers can create businesses');
    
    const images = files?.images
      ? await Promise.all(files.images.map(file => uploadImage(file, 'businesses')))
      : [];
    const documents = files?.documents
      ? await Promise.all(files.documents.map(file => uploadImage(file, 'business_documents')))
      : [];

    console.log('Creating business with data:', {
      ...data,
      userId: user.userId,
      images,
      documents,
      submittedDate: new Date(),
    });

    const business = new Business({
      ...data,
      userId: user.userId,
      images,
      documents,
      submittedDate: new Date(),
    });
    
    console.log('Business before save:', business);
    const savedBusiness = await business.save();
    console.log('Business after save:', savedBusiness);

    // Create notification (optional - if Notification model exists)
    try {
      await Notification.create({
        userId: user.userId,
        type: 'business',
        message: `Business ${data.title} submitted for review`,
        relatedId: savedBusiness._id,
      });
    } catch (error) {
      console.log('Notification creation failed:', error.message);
    }

    return savedBusiness;
  },

  async getMyBusiness(user) {
    const business = await Business.findOne({ userId: user.userId }).populate('category', 'name description');
    if (!business) throw new NotFoundError('Business not found');
    return business;
  },

  async updatePhotos(id, files, user) {
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');
    if (business.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new UnauthorizedError('Unauthorized');
    }

    if (files?.images) {
      for (const image of business.images) {
        if (image.publicId) await deleteImage(image.publicId);
      }
      business.images = await Promise.all(files.images.map(file => uploadImage(file, 'businesses')));
    }
    await business.save();
    return business;
  },

  async updateHours(id, hours, user) {
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');
    if (business.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new UnauthorizedError('Unauthorized');
    }

    business.hours = hours;
    await business.save();
    return business;
  },

  async getCategories() {
    return await Category.find();
  },

  async search({ query, category, page, limit }) {
    const searchQuery = {
      status: 'approved',
    };
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

  async getAll({ status, search, page, limit }) {
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subcategory: { $regex: search, $options: 'i' } },
      ];
    }
    const businesses = await Business.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email phone')
      .populate('category', 'name');
    const total = await Business.countDocuments(query);
    return { businesses, total, page, limit };
  },

  async getById(id) {
    const business = await Business.findById(id)
      .populate('userId', 'name email phone')
      .populate('category', 'name');
    if (!business) throw new NotFoundError('Business not found');
    return business;
  },

  async update(id, data, files, user) {
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');
    if (business.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new UnauthorizedError('Unauthorized');
    }

    if (files?.images) {
      for (const image of business.images) {
        if (image.publicId) await deleteImage(image.publicId);
      }
      business.images = await Promise.all(files.images.map(file => uploadImage(file, 'businesses')));
    }
    if (files?.documents) {
      for (const doc of business.documents) {
        if (doc.publicId) await deleteImage(doc.publicId);
      }
      business.documents = await Promise.all(files.documents.map(file => uploadImage(file, 'business_documents')));
    }

    Object.assign(business, data);
    await business.save();
    return business;
  },

  async updateStatus(id, status, user) {
    if (user.userType !== 'admin') throw new UnauthorizedError('Only admins can update business status');
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');

    business.status = status;
    if (status === 'approved') business.approvalDate = new Date();
    if (status === 'under_review') business.reviewStartDate = new Date();
    await business.save();

    await Notification.create({
      userId: business.userId,
      type: 'business',
      message: `Business ${business.name} ${status}`,
      relatedId: business._id,
    });

    return business;
  },
};