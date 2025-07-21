import { User } from '../models/index.js';
import { generateToken } from '../utils/index.js';

export const AuthService = {
  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }
    const token = generateToken({ userId: user._id, email: user.email, userType: user.userType });
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        isPhoneVerified: user.isPhoneVerified,
        phone: user.phone,
        businessInfo: user.businessInfo || null,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async signup(userData) {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) throw new Error('Email already in use');
    
    // Normalize phone number - add +91 if no country code
    const normalizedPhone = userData.phone.startsWith('+') ? userData.phone : `+91${userData.phone}`;
    
    const existingPhone = await User.findOne({ phone: normalizedPhone });
    if (existingPhone) throw new Error('Phone number already in use');

    // Handle business partner signup
    let businessInfo = null;
    if (userData.userType === 'seller') {
      businessInfo = {
        businessName: userData.businessName,
        businessType: userData.businessType,
        businessAddress: userData.businessAddress,
        productCategories: userData.productCategories,
        serviceCategories: userData.serviceCategories,
        isVerified: false,
      };
    }

    const user = new User({
      name: userData.fullName || userData.name,
      email: userData.email.toLowerCase(),
      phone: normalizedPhone,
      password: userData.password,
      userType: userData.userType || 'customer',
      businessInfo: businessInfo,
    });
    
    await user.save();
    const token = generateToken({ userId: user._id, email: user.email, userType: user.userType });
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        phone: user.phone,
        businessInfo: user.businessInfo || null,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async sendOTP(phone) {
    const user = await User.findOne({ phone });
    if (!user) throw new Error('User not found with this phone number');

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.currentOTP = { code: otpCode, expiresAt, attempts: 0 };
    await user.save();

    // TODO: Integrate SMS provider (e.g., Twilio) to send OTP
    console.log(`OTP generated for ${phone}: ${otpCode}`);

    return { message: 'OTP sent successfully', expiresIn: '10 minutes' };
  },

  async loginWithOTP(phone, otp) {
    const user = await User.findOne({ phone });
    if (!user) throw new Error('User not found with this phone number');
    if (!user.currentOTP || !user.currentOTP.code) throw new Error('No OTP found');
    if (new Date() > user.currentOTP.expiresAt) throw new Error('OTP expired');
    if (user.currentOTP.attempts >= 3) throw new Error('Too many failed attempts');
    if (user.currentOTP.code !== otp) {
      user.currentOTP.attempts += 1;
      await user.save();
      throw new Error(`Invalid OTP. ${3 - user.currentOTP.attempts} attempts remaining`);
    }

    user.currentOTP = undefined;
    user.isPhoneVerified = true;
    await user.save();

    const token = generateToken({ userId: user._id, email: user.email, userType: user.userType });
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        isVerified: user.isVerified,
        isPhoneVerified: user.isPhoneVerified,
        businessInfo: user.businessInfo || null,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async verifyOTP(phone, otp) {
    const user = await User.findOne({ phone });
    if (!user) throw new Error('User not found with this phone number');
    if (!user.currentOTP || !user.currentOTP.code) throw new Error('No OTP found');
    if (new Date() > user.currentOTP.expiresAt) throw new Error('OTP expired');
    if (user.currentOTP.attempts >= 3) throw new Error('Too many failed attempts');
    if (user.currentOTP.code !== otp) {
      user.currentOTP.attempts += 1;
      await user.save();
      throw new Error(`Invalid OTP. ${3 - user.currentOTP.attempts} attempts remaining`);
    }

    user.currentOTP = undefined;
    user.isPhoneVerified = true;
    await user.save();

    return {
      message: 'OTP verified successfully',
      isPhoneVerified: true,
    };
  },

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password -currentOTP');
    if (!user) throw new Error('User not found');
    
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified,
      isBanned: user.isBanned,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      profile: user.profile,
      businessInfo: user.businessInfo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async updateProfile(userId, updateData, file) {
    console.log('=== BACKEND PROFILE UPDATE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Update data received:', JSON.stringify(updateData, null, 2));
    console.log('File:', file);
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    console.log('User before update:', JSON.stringify({
      id: user._id,
      name: user.name,
      profile: user.profile
    }, null, 2));

    // Update basic fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.email) user.email = updateData.email.toLowerCase();

    // Initialize profile if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile fields
    if (updateData.profile) {
      console.log('Updating profile fields:', updateData.profile);
      
      // Update bio
      if (updateData.profile.bio !== undefined) {
        user.profile.bio = updateData.profile.bio;
        console.log('Updated bio to:', user.profile.bio);
      }

      // Update address fields
      if (updateData.profile.address) {
        if (!user.profile.address) {
          user.profile.address = {};
        }
        
        if (updateData.profile.address.street !== undefined) {
          user.profile.address.street = updateData.profile.address.street;
        }
        if (updateData.profile.address.city !== undefined) {
          user.profile.address.city = updateData.profile.address.city;
        }
        if (updateData.profile.address.state !== undefined) {
          user.profile.address.state = updateData.profile.address.state;
        }
        if (updateData.profile.address.pincode !== undefined) {
          user.profile.address.pincode = updateData.profile.address.pincode;
        }
        
        console.log('Updated address to:', user.profile.address);
      }
    }

    // Handle avatar upload if file is provided
    if (file) {
      console.log('Processing avatar upload...');
      console.log('File details:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hasBuffer: !!file.buffer,
        hasPath: !!file.path,
        bufferLength: file.buffer ? file.buffer.length : 0
      });
      
      try {
        // Import cloudinary functions when needed
        const { uploadImage, deleteImage } = await import('../utils/cloudinary.js');
        
        // Delete old avatar if exists
        if (user.profile?.avatarPublicId) {
          console.log('Deleting old avatar:', user.profile.avatarPublicId);
          await deleteImage(user.profile.avatarPublicId);
        }

        // Upload new avatar
        console.log('Uploading new avatar...');
        const result = await uploadImage(file, 'profiles');
        console.log('Upload result:', result);
        
        user.profile.avatar = result.url;
        user.profile.avatarPublicId = result.publicId;
        
        console.log('Avatar updated to:', user.profile.avatar);
      } catch (error) {
        console.error('Avatar upload failed:', error);
        throw new Error(`Avatar upload failed: ${error.message}`);
      }
    }

    await user.save();
    console.log('User saved successfully');

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      isVerified: user.isVerified,
      isPhoneVerified: user.isPhoneVerified,
      profile: user.profile,
      businessInfo: user.businessInfo,
      updatedAt: user.updatedAt,
    };
  },

  async logout(userId) {
    // For JWT-based authentication, logout is typically handled client-side
    // by removing the token. However, we can update the user's lastLogin time
    // or perform any cleanup operations here if needed.
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Update last activity or perform any logout-specific operations
    user.lastLogin = new Date();
    await user.save();
    
    return { message: 'Logged out successfully' };
  },
};