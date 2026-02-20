import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://localhost:27017/fitforge";

export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI || DEFAULT_URI;
  await mongoose.connect(uri);
}

export { mongoose };

