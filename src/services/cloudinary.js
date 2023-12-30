import cloudinary from "cloudinary";
import config from "../config/index.js";

const cloudnairyconnect = () => {
  try {
    cloudinary.v2.config({
      cloud_name: config.CD_CLOUD_NAME,
      api_key: config.CD_API_KEY,
      api_secret: config.CD_API_SECRET,
    });
    console.log("CD connected");
  } catch (error) {
    console.log("error connecting CD" + error);
  }
};

export default cloudnairyconnect;
