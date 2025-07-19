import { UserService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const userController = {
  async getAll(req, res, next) {
    try {
      const { search, page = 1, limit = 10 } = req.query;
      const users = await UserService.getAll({ search, page, limit });
      sendResponse(res, 200, {
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getBanned(req, res, next) {
    try {
      const users = await UserService.getBanned();
      sendResponse(res, 200, {
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await UserService.getById(req.params.id, req.user);
      sendResponse(res, 200, {
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const user = await UserService.update(req.params.id, req.body, req.file, req.user);
      sendResponse(res, 200, {
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async banUser(req, res, next) {
    try {
      const user = await UserService.banUser(req.params.id, req.body.isBanned, req.user);
      sendResponse(res, 200, {
        success: true,
        message: `User ${req.body.isBanned ? 'banned' : 'unbanned'} successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await UserService.delete(req.params.id);
      sendResponse(res, 200, {
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};