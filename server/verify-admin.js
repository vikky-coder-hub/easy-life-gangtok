import mongoose from 'mongoose';
import { User } from './src/api/models/User.js';
import 'dotenv/config';

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and verify admin user
    const admin = await User.findOneAndUpdate(
      { email: 'admin@easylife.com', userType: 'admin' },
      { isVerified: true, isPhoneVerified: true },
      { new: true }
    );

    if (admin) {
      console.log('✅ Admin verified successfully:', admin.email);
      console.log('Admin details:', {
        name: admin.name,
        email: admin.email,
        userType: admin.userType,
        isVerified: admin.isVerified,
        isPhoneVerified: admin.isPhoneVerified
      });
    } else {
      console.log('❌ Admin not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

verifyAdmin();