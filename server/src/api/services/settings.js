import { WebsiteConfig } from '../models/index.js';

export const SettingsService = {
  async getSettings() {
    let settings = await WebsiteConfig.findOne();
    if (!settings) {
      settings = new WebsiteConfig({
        homepage: { hero: {}, categoriesGrid: {}, hotDeals: { products: [] }, serviceSlider: {} },
        about: { hero: {}, mission: {}, vision: {}, team: [], coreValues: [], stats: [] },
        contact: { contactInfo: [], supportCategories: [], businessHours: { schedule: [] } },
        privacy: { hero: {}, sections: [] },
        terms: { hero: {}, sections: [] },
        support: { categories: [], contactMethods: [], faq: [], resources: [] },
      });
      await settings.save();
    }
    return settings;
  },

  async updateSettings(data) {
    let settings = await WebsiteConfig.findOne();
    if (!settings) {
      settings = new WebsiteConfig(data);
    } else {
      Object.assign(settings, data);
    }
    await settings.save();
    return settings;
  },
};