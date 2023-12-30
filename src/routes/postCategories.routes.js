import express from "express";
import { authGuard, adminGuard } from "../middlewares/authMiddleware.js";
import {
  createPostCategory,
  deletePostCategory,
  getAllPostCategories,
  updatePostCategory,
} from "../controllers/postCategoriesController.js";

const router = express.Router();

router.post("/", authGuard, adminGuard, createPostCategory);
router.get("/", getAllPostCategories);
router.put("/:postCategoryId", authGuard, adminGuard, updatePostCategory);
router.delete("/:categoryId", authGuard, adminGuard, deletePostCategory);

export default router;
