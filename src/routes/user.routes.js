import express from "express";

import { authGuard } from "../middlewares/authMiddleware.js";
import {
  loginUser,
  registerUser,
  userProfile,
  updateProfile,
  updateProfilePicture,
} from "../controllers/userControllers.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authGuard, userProfile);
router.put("/updateProfile", authGuard, updateProfile);
router.put("/updateProfilePicture", authGuard, updateProfilePicture);

export default router;
