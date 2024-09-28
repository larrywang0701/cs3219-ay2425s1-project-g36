import mongoose, { Mongoose } from "mongoose";
import { USER_SERVICE_MONGO_URI, BLIST_MONGO_URI } from '../utils/config';

const connectMongoDB = async () => {
  try {
      const user_conn: Mongoose = await mongoose.connect(USER_SERVICE_MONGO_URI);
      const blist_conn: Mongoose = await mongoose.connect(BLIST_MONGO_URI);
      console.log(`MongoDB connected: ${user_conn.connection.host}`);
      console.log(`MongoDB connected: ${blist_conn.connection.host}`);
  } catch (error) {
      if (error instanceof Error) {
          console.error(`Error connecting to MongoDB: ${error.message}`);
      } else {
          console.error('Unknown error connecting to MongoDB');
      }
  }
};

export default connectMongoDB;