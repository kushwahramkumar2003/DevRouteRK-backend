import Post from "../models/Post.js";
import PostCategories from "../models/PostCategories.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createPostCategory = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { title } = req.body;

  const postCategory = await PostCategories.findOne({ title });

  if (postCategory) {
    res.status(400);
    throw new Error("Post category already exists");
  }

  const newPostCategory = await PostCategories.create({ title });
  res.status(201).json(newPostCategory);
});

export const getAllPostCategories = asyncHandler(async (req, res) => {
  const postCategories = await PostCategories.find();

  if (!postCategories) {
    res.status(400);
    throw new Error("Post category not exists");
  }

  res.status(201).json(postCategories);
});

export const updatePostCategory = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const postCategories = await PostCategories.findByIdAndUpdate(
    req.params.postCategoryId,
    { title },
    { new: true }
  );

  if (!postCategories) {
    res.status(400);
    throw new Error("Post category not exists");
  }

  res.status(201).json(postCategories);
});
export const deletePostCategory = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;

  await Post.updateMany(
    {
      categories: { $in: [categoryId] },
    },
    { $pull: { categories: categoryId } }
  );

  await PostCategories.deleteOne({ _id: categoryId });

  res.status(201).json({ message: "Post category deleted successfully" });
});
