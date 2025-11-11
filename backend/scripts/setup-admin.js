const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://abdulhaseebmughal:HaseebKhan19006@cluster0.2c3nmxz.mongodb.net/saveit?retryWrites=true&w=majority';

// Admin credentials
const ADMIN_EMAIL = 'abdulhaseebmughal2006@gmail.com';
const ADMIN_PASSWORD = 'Haseebkhan19006';
const ADMIN_NAME = 'Abdul Haseeb Mughal';

async function setupAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if admin exists
    console.log('🔍 Checking for admin user...');
    const existingAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL.toLowerCase() });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Verified: ${existingAdmin.isVerified}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);

      // Update admin password if needed
      console.log('\n🔄 Updating admin password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      await usersCollection.updateOne(
        { email: ADMIN_EMAIL.toLowerCase() },
        {
          $set: {
            password: hashedPassword,
            isVerified: true,
            name: ADMIN_NAME,
            updatedAt: new Date()
          },
          $unset: {
            otp: ""
          }
        }
      );

      console.log('✅ Admin password updated and verified\n');
    } else {
      // Create admin user
      console.log('🔄 Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

      const adminUser = {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await usersCollection.insertOne(adminUser);
      console.log('✅ Admin user created successfully\n');
    }

    // List all indexes to ensure proper setup
    console.log('📋 Verifying database indexes...');
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: unique=${index.unique || false}`);
    });

    // Count all users
    const userCount = await usersCollection.countDocuments();
    console.log(`\n👥 Total users in database: ${userCount}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Admin Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Credentials:');
    console.log(`  Email: ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
