import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/index.js';

export const cloudinaryConfig = () => {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
};

export const uploadImage = async (file, folder) => {
  try {
    console.log('=== CLOUDINARY UPLOAD DEBUG ===');
    console.log('File object:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
      hasPath: !!file.path
    });

    let uploadResult;

    // Check if file has buffer (multer memoryStorage) or path (multer diskStorage)
    if (file.buffer) {
      // Upload from buffer (memoryStorage)
      console.log('Uploading from buffer...');
      uploadResult = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        {
          folder,
          resource_type: 'auto',
          public_id: `${folder}_${Date.now()}`, // Unique filename
        }
      );
    } else if (file.path) {
      // Upload from file path (diskStorage)
      console.log('Uploading from file path...');
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });
    } else {
      throw new Error('File must have either buffer or path property');
    }

    console.log('Cloudinary upload successful:', {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id
    });

    return { 
      url: uploadResult.secure_url, 
      publicId: uploadResult.public_id 
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};