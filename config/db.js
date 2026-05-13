import mongoose from "mongoose";

const connectDB = async () => {

  try {

    // 🔥 IF ALREADY CONNECTED
    if (mongoose.connection.readyState === 1) {

      console.log("MongoDB Already Connected");

      return;
    }

    // 🔥 CONNECT
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Doctor_panel",
    });

    console.log("MongoDB Connected");

  } catch (error) {

    console.log("MongoDB Connection Error:");

    console.log(error);

    throw error;
  }
};

export default connectDB;
