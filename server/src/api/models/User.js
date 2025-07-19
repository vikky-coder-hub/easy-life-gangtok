import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  userType: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  profile: {
    bio: String,
    avatar: String,
    avatarPublicId: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  },
  businessInfo: {
    businessName: String,
    businessType: {
      type: String,
      enum: ['product', 'service', 'bike_rider', 'taxi_service'],
    },
    businessDescription: String,
    businessAddress: String, // Simple address string as per frontend
    productCategories: [{
      type: String,
      enum: ['electronics', 'home', 'clothing', 'sports', 'food', 'books', 'health', 'beauty'],
    }],
    serviceCategories: [{
      type: String,
      enum: ['cleaning', 'repair', 'beauty', 'fitness', 'education', 'consulting'],
    }],
    businessLicense: String,
    businessLicensePublicId: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  currentOTP: {
    code: String,
    expiresAt: Date,
    attempts: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);