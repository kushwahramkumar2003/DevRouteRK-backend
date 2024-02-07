import express from "express";

import { adminGuard, authGuard } from "../middlewares/authMiddleware.js";
import {
  createComment,
  deleteComment,
  getAllComments,
  updateComment,
} from "../controllers/commentControllers.js";
const router = express.Router();

router.post("/", authGuard, createComment);
router.put("/:commentId", authGuard, updateComment);
router.delete("/:commentId", deleteComment);
router.get("/", authGuard, adminGuard, getAllComments);

export default router;
