/* import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export default client; */

// db/index.js
// Import mongoose
import mongoose from "mongoose";

try {
  // Connect
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
} catch (error) {
  // Log error and end Node process if it fails
  console.error("MongoDB connection error:", error);
  process.exit(1);
}

export default mongoose.connection;
