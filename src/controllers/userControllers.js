import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";
import { uploadPicture } from "../middlewares/uploadPictureMiddleware.js";
import fileRemover from "../utils/fileRemover.js";
import { errorResponserHandler } from "../middlewares/errorHandler.js";
import uploadImageToCloudinary from "../utils/imageUploder.js";
import config from "../config/index.js";

export const registerUser = asyncHandler(async (req, res, next) => {
  console.log("req.body : ", req.body);
  const { name, email, password } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });

  if (user) {
    // return res.status(400).json({
    //   success: false,
    //   message: "User already exists",
    // });

    throw new CustomError("User already exists");
  }

  //creating a new user

  user = await User.create({
    name,
    email,
    password,
  });

  console.log("User : ", user);

  //   user.password = undefined;
  const token = await user.generateJWT();

  console.log("Token : ", token);
  res.status(201).json({
    success: true,
    _id: user._id,
    avatar: user.avatar,
    name: user.name,
    email: user.email,
    verified: user.verified,
    admin: user.admin,
    token,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });

  if (!user) {
    throw new CustomError("User does not exists", 403);
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new CustomError("Invalid Credentials", 403);
  }
  user.password = undefined;
  const token = await user.generateJWT();

  console.log("Token : ", token);
  res.status(201).json({
    message: "Login Successful",
    success: true,
    _id: user._id,
    avatar: user.avatar,
    name: user.name,
    email: user.email,
    verified: user.verified,
    admin: user.admin,
    token,
  });
});

export const userProfile = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }
  user.password = undefined;
  res.status(201).json({
    success: true,
    _id: user._id,
    avatar: user.avatar,
    name: user.name,
    email: user.email,
    verified: user.verified,
    admin: user.admin,
  });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password && req.body.password.length > 6) {
      throw new CustomError(
        "Password should be greater than 6 characters",
        400
      );
    } else if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUserProfile = await user.save();

    const token = await updatedUserProfile.generateJWT();

    updatedUserProfile.password = undefined;

    res.status(200).json({
      success: true,
      _id: updatedUserProfile._id,
      avatar: updatedUserProfile.avatar,
      name: updatedUserProfile.name,
      email: updatedUserProfile.email,
      verified: updatedUserProfile.verified,
      admin: updatedUserProfile.admin,
      token,
    });
  } else {
    throw new CustomError("User not found", 404);
  }
});

export const updateProfilePicture = asyncHandler(async (req, res, next) => {
  console.log("here");
  console.log("req.user : ", req.user);
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  if (req.files && req.files.profilePicture) {
    const img = req.files.profilePicture;

    if (!img) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    let uploadDetails = await uploadImageToCloudinary(img, config.FOLDER_NAME);
    console.log("upload details : " + uploadDetails);

    user.avatar = uploadDetails.secure_url;

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      avatar: updatedUser.avatar,
      name: updatedUser.name,
      email: updatedUser.email,
      verified: updatedUser.verified,
      admin: updatedUser.admin,
      token: await updatedUser.generateJWT(),
    });
  } else {
    user.avatar = "";
    const updatedUser = await user.save();

    console.log("updatedUser : ", updatedUser);

    res.json({
      success: true,
      _id: updatedUser._id,
      avatar: updatedUser.avatar,
      name: updatedUser.name,
      email: updatedUser.email,
      verified: updatedUser.verified,
      admin: updatedUser.admin,
      token: await updatedUser.generateJWT(),
    });
  }
});
