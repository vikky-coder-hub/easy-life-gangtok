import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const UploadService = {
  async uploadImages(files, folder = 'general') {
    try {
      const uploadPromises = files.map(file => uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        files: results.map(result => ({
          url: result.url,
          publicId: result.publicId,
        })),
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  },

  async uploadDocuments(files, folder = 'documents') {
    try {
      const uploadPromises = files.map(file => uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      return {
        success: true,
        files: results.map(result => ({
          url: result.url,
          publicId: result.publicId,
          originalName: file.originalname,
        })),
      };
    } catch (error) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
  },

  async deleteFile(publicId) {
    try {
      await deleteImage(publicId);
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  },

  async uploadSingle(file, folder = 'general') {
    try {
      const result = await uploadImage(file, folder);
      return {
        success: true,
        file: {
          url: result.url,
          publicId: result.publicId,
        },
      };
    } catch (error) {
      throw new Error(`Single upload failed: ${error.message}`);
    }
  },
};
