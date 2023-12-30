import cloudinary from "cloudinary";

const uploadImageToCloudinary = async (file, folder, height, quality) => {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }
  options.resource_type = "auto";
  options.quality = 80;

  return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
};

export default uploadImageToCloudinary;
