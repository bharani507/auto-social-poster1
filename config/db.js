import mongoose from "mongoose";

const connectDB = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "doctor panel",
    });

    console.log("MongoDB Connected");

  } catch (error) {

    console.log(error);

  }
};

export default connectDB;