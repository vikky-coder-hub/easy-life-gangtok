// Test script to check business images in database
import mongoose from 'mongoose';
import { Business } from './src/api/models/Business.js';

const MONGODB_URI = 'mongodb+srv://vikkykumar700422:Vikky1234@hanuman-car-wash.34can.mongodb.net/gngtok';

async function testBusinessImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all businesses
    const businesses = await Business.find({});
    console.log(`Found ${businesses.length} businesses`);

    // Check for businesses with images
    const businessesWithImages = businesses.filter(b => b.images && b.images.length > 0);
    console.log(`Businesses with images: ${businessesWithImages.length}`);

    if (businessesWithImages.length > 0) {
      console.log('\n=== BUSINESSES WITH IMAGES ===');
      businessesWithImages.forEach((business, index) => {
        console.log(`\n${index + 1}. Business: ${business.name || business.title}`);
        console.log(`   ID: ${business._id}`);
        console.log(`   Status: ${business.status}`);
        console.log(`   Images count: ${business.images.length}`);
        business.images.forEach((img, imgIndex) => {
          console.log(`   Image ${imgIndex + 1}:`);
          console.log(`     URL: ${img.url}`);
          console.log(`     Public ID: ${img.publicId}`);
        });
      });
    } else {
      console.log('\nNo businesses found with images');
      
      // Show sample business structure
      if (businesses.length > 0) {
        console.log('\n=== SAMPLE BUSINESS STRUCTURE ===');
        const sampleBusiness = businesses[0];
        console.log('Business fields:', Object.keys(sampleBusiness.toObject()));
        console.log('Images field:', sampleBusiness.images);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testBusinessImages();