import express from "express";

import { authGuard } from "../middlewares/authMiddleware.js";
import {
  createComment,
  deleteComment,
  updateComment,
} from "../controllers/commentControllers.js";
const router = express.Router();

router.post("/", authGuard, createComment);
router.put("/:commentId", authGuard, updateComment);
router.delete("/:commentId", deleteComment);

export default router;
