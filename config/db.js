import mongoose from "mongoose";

const connectDB = async () => {

  try {

    // 🔥 PREVENT MULTIPLE CONNECTIONS
    if (mongoose.connections[0].readyState) {

      console.log("MongoDB Already Connected");

      return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "wynsync-growth-development",
    });

    console.log("MongoDB Connected");

  } catch (error) {

    console.log("MongoDB Error:");

    console.log(error);
  }
};

export default connectDB;
