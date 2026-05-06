import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.DB_URI;

if (!MONGODB_URI) {
  console.error('Error: DB_URI is not defined in .env');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Successfully connected to MongoDB!');
    
    // Check if we can list collections or something
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log('Collections in database:', collections?.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

testConnection();
