import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.set("strictQuery", true);

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB connection established successfully.");
    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ Unable to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

export { mongoose };