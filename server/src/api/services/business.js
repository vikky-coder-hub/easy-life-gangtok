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
    console.log('=== UPDATE PHOTOS SERVICE DEBUG ===');
    console.log('Files received:', files);
    console.log('Files type:', typeof files);
    console.log('Is files an array?', Array.isArray(files));
    console.log('Files length:', files?.length);
    
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');
    if (business.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new UnauthorizedError('Unauthorized');
    }

    // Handle files from multer.array('images', 5) - files is directly an array
    if (files && files.length > 0) {
      console.log('Processing', files.length, 'files for upload');
      
      // Delete existing images from cloudinary
      for (const image of business.images) {
        if (image.publicId) {
          console.log('Deleting existing image:', image.publicId);
          await deleteImage(image.publicId);
        }
      }
      
      // Upload new images
      console.log('Uploading new images...');
      business.images = await Promise.all(files.map(file => {
        console.log('Uploading file:', file.originalname);
        return uploadImage(file, 'businesses');
      }));
      
      console.log('Upload complete. New images:', business.images);
    } else {
      console.log('No files to process');
    }
    
    await business.save();
    console.log('Business saved with images:', business.images);
    return business;
  },

  async deleteImage(id, publicId, user) {
    console.log('=== DELETE IMAGE SERVICE DEBUG ===');
    console.log('Business ID:', id);
    console.log('Public ID to delete:', publicId);
    
    const business = await Business.findById(id);
    if (!business) throw new NotFoundError('Business not found');
    if (business.userId.toString() !== user.userId && user.userType !== 'admin') {
      throw new UnauthorizedError('Unauthorized');
    }

    // Find the image to delete
    const imageIndex = business.images.findIndex(img => img.publicId === publicId);
    if (imageIndex === -1) {
      throw new NotFoundError('Image not found');
    }

    const imageToDelete = business.images[imageIndex];
    console.log('Found image to delete:', imageToDelete);

    // Delete from Cloudinary
    if (imageToDelete.publicId) {
      console.log('Deleting from Cloudinary:', imageToDelete.publicId);
      await deleteImage(imageToDelete.publicId);
    }

    // Remove from business images array
    business.images.splice(imageIndex, 1);
    await business.save();
    
    console.log('Image deleted successfully. Remaining images:', business.images.length);
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
    
    console.log('=== BACKEND BUSINESS SERVICE DEBUG ===');
    console.log('Query:', query);
    console.log('Found businesses:', businesses.length);
    
    // Debug businesses with images
    const businessesWithImages = businesses.filter(b => b.images && b.images.length > 0);
    console.log('Businesses with images:', businessesWithImages.length);
    
    if (businessesWithImages.length > 0) {
      console.log('Sample business with images:', {
        id: businessesWithImages[0]._id,
        name: businessesWithImages[0].name || businessesWithImages[0].title,
        imageCount: businessesWithImages[0].images.length,
        firstImage: businessesWithImages[0].images[0]
      });
    }
    
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