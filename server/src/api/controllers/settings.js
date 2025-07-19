import { SettingsService } from '../services/index.js';
import { sendResponse } from '../utils/index.js';

export const settingsController = {
  async getSettings(req, res, next) {
    try {
      const settings = await SettingsService.getSettings();
      sendResponse(res, 200, {
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req, res, next) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      sendResponse(res, 200, {
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },
};