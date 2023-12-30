import config from "../config/index.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";

export const authGuard = asyncHandler(async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      // console.log("token : ", token);

      const { id } = jwt.verify(token, config.JWT_SECRET);
      // console.log("id : ", id);
      req.user = await User.findById(id).select("-password");
      // console.log("req.user : ", req.user);
      next();
    } catch (error) {
      throw new CustomError("Not authorized, Token failed", 401);
    }
  } else {
    throw new CustomError("Not authorized, no token", 401);
  }
});

export const adminGuard = asyncHandler((req, res, next) => {
  console.log("req.user.admin : ", req.user.admin);
  if (req.user && req.user.admin) {
    next();
  } else throw new CustomError("Not authorized as an admin", 401);
});
