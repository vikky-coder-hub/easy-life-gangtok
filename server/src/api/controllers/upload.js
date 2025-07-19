import { UploadService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const uploadController = {
  async uploadImages(req, res, next) {
    try {
      const files = await UploadService.uploadImages(req.files, req.body.folder);
      sendResponse(res, 201, {
        success: true,
        message: 'Images uploaded successfully',
        data: files,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadDocuments(req, res, next) {
    try {
      const files = await UploadService.uploadDocuments(req.files, req.body.folder);
      sendResponse(res, 201, {
        success: true,
        message: 'Documents uploaded successfully',
        data: files,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req, res, next) {
    try {
      await UploadService.deleteFile(req.params.id);
      sendResponse(res, 200, {
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};