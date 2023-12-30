import express from "express";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import commentRoutes from "./comment.routes.js";
import postCategoriesRoutes from "./postCategories.routes.js";
const router = express.Router();

router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/post-categories", postCategoriesRoutes);

export default router;
