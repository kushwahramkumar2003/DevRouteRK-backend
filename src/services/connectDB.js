import mongoose from "mongoose";
import config from "../config/index.js";
import asyncHandler from "../utils/asyncHandler.js";

const connect = asyncHandler(async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("DB Connected!!");
  } catch (error) {
    console.log("Error in connecting to DB ", error);
    throw error;
  }
});

export default connect;
