import mongoose from 'mongoose';

const websiteConfigSchema = new mongoose.Schema({
  homepage: {
    hero: {
      title: String,
      subtitle: String,
      description: String,
    },
    categoriesGrid: {
      title: String,
      description: String,
      selectedCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      showViewAllButton: Boolean,
    },
    hotDeals: {
      title: String,
      maxItems: Number,
      products: [{
        id: Number,
        title: String,
        category: String,
        price: String,
        originalPrice: String,
        discount: String,
        rating: Number,
        reviews: Number,
        seller: String,
        location: String,
        image: String,
        publicId: String,
      }],
    },
    serviceSlider: {
      enabled: Boolean,
      title: String,
      selectedCategory: String,
      description: String,
      maxItems: Number,
      isRandomized: Boolean,
    },
  },
  about: {
    hero: {
      title: String,
      subtitle: String,
      description: String,
    },
    mission: {
      title: String,
      description: String,
    },
    vision: {
      title: String,
      description: String,
    },
    team: [{
      name: String,
      role: String,
      image: String,
      publicId: String,
    }],
    coreValues: [String],
    stats: [{
      title: String,
      value: String,
    }],
  },
  contact: {
    contactInfo: [{
      title: String,
      value: String,
      description: String,
    }],
    supportCategories: [{
      title: String,
      description: String,
    }],
    businessHours: {
      schedule: [{
        day: String,
        hours: String,
      }],
    },
  },
  privacy: {
    hero: {
      title: String,
      subtitle: String,
      lastUpdated: String,
    },
    sections: [{
      title: String,
      content: [String],
    }],
  },
  terms: {
    hero: {
      title: String,
      subtitle: String,
      lastUpdated: String,
    },
    sections: [{
      title: String,
      content: [String],
    }],
  },
  support: {
    categories: [{
      title: String,
      description: String,
    }],
    contactMethods: [{
      title: String,
      value: String,
      availability: String,
    }],
    faq: [{
      question: String,
      answer: String,
    }],
    resources: [{
      title: String,
      url: String,
    }],
  },
}, {
  timestamps: true,
});

export const WebsiteConfig = mongoose.model('WebsiteConfig', websiteConfigSchema);