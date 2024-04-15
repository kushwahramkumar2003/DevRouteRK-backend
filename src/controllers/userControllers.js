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
  const userIdToUpdate = req.params.userId;

  let userId = req.user._id;

  if (!req.user.admin && userId !== userIdToUpdate) {
    let error = new Error("Forbidden resource");
    error.statusCode = 403;
    throw error;
  }

  let user = await User.findById(userIdToUpdate);

  if (!user) {
    throw new Error("User not found");
  }

  if (typeof req.body.admin !== "undefined" && req.user.admin) {
    user.admin = req.body.admin;
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.body.password && req.body.password.length < 6) {
    throw new Error("Password length must be at least 6 character");
  } else if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUserProfile = await user.save();

  res.json({
    _id: updatedUserProfile._id,
    avatar: updatedUserProfile.avatar,
    name: updatedUserProfile.name,
    email: updatedUserProfile.email,
    verified: updatedUserProfile.verified,
    admin: updatedUserProfile.admin,
    token: await updatedUserProfile.generateJWT(),
  });
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

export const getAllUsers = async (req, res, next) => {
  try {
    const filter = req.query.searchKeyword;
    let where = {};
    if (filter) {
      where.email = { $regex: filter, $options: "i" };
    }
    let query = User.find(where);
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * pageSize;
    const total = await User.find(where).countDocuments();
    const pages = Math.ceil(total / pageSize);

    res.header({
      "x-filter": filter,
      "x-count": JSON.stringify(pages),
      "x-totalcount": JSON.stringify(total),
      "x-currentpage": JSON.stringify(page),
      "x-pagesize": JSON.stringify(pageSize),
      "x-totalpagecount": JSON.stringify(pages),
      "Access-Control-Expose-Headers":
        "x-filter, x-totalCount, x-currentPage, x-pageSize, x-totalpagescount, x-count",
    });

    if (page > pages) {
      return res.json([]);
    }

    const result = await query
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: "desc" });

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.userId);

    if (!user) {
      throw new Error("User no found");
    }

    const postsToDelete = await Post.find({ user: user._id });
    const postIdsToDelete = postsToDelete.map((post) => post._id);

    await Comment.deleteMany({
      post: { $in: postIdsToDelete },
    });

    await Post.deleteMany({
      _id: { $in: postIdsToDelete },
    });

    postsToDelete.forEach((post) => {
      fileRemover(post.photo);
    });

    await user.remove();
    fileRemover(user.avatar);

    res.status(204).json({ message: "User is deleted successfully" });
  } catch (error) {
    next(error);
  }
};
