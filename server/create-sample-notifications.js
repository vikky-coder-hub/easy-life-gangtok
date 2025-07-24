import 'dotenv/config';
import mongoose from 'mongoose';
import { Notification, User } from './src/api/models/index.js';

const createSampleNotifications = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a user to assign notifications to
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      process.exit(1);
    }

    // Sample notifications for sellers
    const sampleNotifications = [
      {
        userId: users[0]._id,
        type: 'booking',
        category: 'business',
        title: 'New Urgent Booking Request',
        message: 'Emergency electrical repair needed at MG Road, Gangtok',
        priority: 'high',
        actionRequired: true,
        customer: 'Rajesh Sharma',
        amount: 1500,
        source: 'Booking System',
        actions: ['Review', 'Accept', 'Decline'],
      },
      {
        userId: users[0]._id,
        type: 'review',
        category: 'business',
        title: 'New 5-Star Review Received',
        message: 'Excellent service and very professional staff!',
        priority: 'medium',
        customer: 'Priya Devi',
        source: 'Review System',
        actions: ['View', 'Respond'],
      },
      {
        userId: users[0]._id,
        type: 'payment',
        category: 'financial',
        title: 'Payment Received',
        message: '₹2,500 payment confirmed for electrical installation',
        priority: 'medium',
        customer: 'Deepak Rai',
        amount: 2500,
        source: 'Payment Gateway',
        isRead: true,
      },
      {
        userId: users[0]._id,
        type: 'inquiry',
        category: 'business',
        title: 'New Service Inquiry',
        message: 'Looking for home automation installation services',
        priority: 'medium',
        actionRequired: true,
        customer: 'Sita Gurung',
        source: 'Contact Form',
        actions: ['View', 'Respond'],
      },
      {
        userId: users[0]._id,
        type: 'system',
        category: 'system',
        title: 'Profile Views Spike',
        message: 'Your profile received 50+ views in the last hour',
        priority: 'low',
        source: 'Analytics System',
      },
    ];

    // Admin notifications if admin user exists
    const adminUser = users.find(u => u.userType === 'admin');
    if (adminUser) {
      sampleNotifications.push(
        {
          userId: adminUser._id,
          type: 'urgent',
          category: 'security',
          title: 'Suspicious Login Activity Detected',
          message: 'Multiple failed login attempts detected from IP 192.168.1.100',
          priority: 'high',
          source: 'Security System',
          actions: ['Investigate', 'Block IP', 'Notify User'],
        },
        {
          userId: adminUser._id,
          type: 'warning',
          category: 'financial',
          title: 'Payment Settlement Pending',
          message: '₹45,000 in pending settlements require manual review',
          priority: 'high',
          source: 'Payment Gateway',
          actions: ['Review Settlements', 'Process Payments'],
        },
        {
          userId: adminUser._id,
          type: 'info',
          category: 'business',
          title: 'New Business Registration',
          message: 'HomeFix Solutions submitted registration for electrical services',
          priority: 'medium',
          source: 'Business Management',
          isRead: true,
          actions: ['Review Application', 'Approve', 'Request More Info'],
        }
      );
    }

    // Create notifications
    const createdNotifications = await Notification.insertMany(sampleNotifications);
    console.log(`Created ${createdNotifications.length} sample notifications`);

    // Show stats
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const urgentNotifications = await Notification.countDocuments({ priority: 'high' });

    console.log('\n--- Notification Stats ---');
    console.log(`Total: ${totalNotifications}`);
    console.log(`Unread: ${unreadNotifications}`);
    console.log(`High Priority: ${urgentNotifications}`);

    console.log('\n--- Sample notifications created successfully! ---');
    console.log('You can now test the notification system in the frontend.');

  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleNotifications();
