import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', true);

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ksie_cargo';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

export { mongoose };
