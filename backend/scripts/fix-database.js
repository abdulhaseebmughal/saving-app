const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://abdulhaseebmughal:HaseebKhan19006@cluster0.2c3nmxz.mongodb.net/saveit?retryWrites=true&w=majority';

async function fixDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop old username index
    try {
      await usersCollection.dropIndex('username_1');
      console.log('✅ Dropped old username index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Username index does not exist (already dropped)');
      } else {
        console.log('⚠️  Could not drop username index:', error.message);
      }
    }

    // Ensure email index exists
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ Created email index');
    } catch (error) {
      console.log('ℹ️  Email index already exists');
    }

    // List all indexes
    const indexes = await usersCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${JSON.stringify(index.key)}: unique=${index.unique || false}`);
    });

    console.log('\n✅ Database fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database:', error);
    process.exit(1);
  }
}

fixDatabase();
