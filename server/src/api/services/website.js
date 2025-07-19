import { WebsiteConfig } from '../models/index.js';
import { uploadImage, deleteImage } from '../utils/cloudinary.js';

export const WebsiteService = {
  async getConfig() {
    let config = await WebsiteConfig.findOne();
    if (!config) {
      config = new WebsiteConfig({
        homepage: { hero: {}, categoriesGrid: {}, hotDeals: { products: [] }, serviceSlider: {} },
        about: { hero: {}, mission: {}, vision: {}, team: [], coreValues: [], stats: [] },
        contact: { contactInfo: [], supportCategories: [], businessHours: { schedule: [] } },
        privacy: { hero: {}, sections: [] },
        terms: { hero: {}, sections: [] },
        support: { categories: [], contactMethods: [], faq: [], resources: [] },
      });
      await config.save();
    }
    return config;
  },

  async updateConfig(data, files) {
    let config = await WebsiteConfig.findOne();
    if (!config) {
      config = new WebsiteConfig(data);
    } else {
      if (files?.hotDealsImages) {
        const images = await Promise.all(files.hotDealsImages.map(file => uploadImage(file, 'website/hot_deals')));
        data.homepage.hotDeals.products = data.homepage.hotDeals.products.map((product, index) => ({
          ...product,
          image: images[index]?.url || product.image,
          publicId: images[index]?.publicId || product.publicId,
        }));
      }
      if (files?.teamImages) {
        const images = await Promise.all(files.teamImages.map(file => uploadImage(file, 'website/team')));
        data.about.team = data.about.team.map((member, index) => ({
          ...member,
          image: images[index]?.url || member.image,
          publicId: images[index]?.publicId || member.publicId,
        }));
      }
      Object.assign(config, data);
    }
    await config.save();
    return config;
  },
};