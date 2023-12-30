import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";

export const createComment = asyncHandler(async (req, res) => {
  const { desc, slug, parent, replyOnUser } = req.body;

  const post = await Post.findOne({ slug: slug });

  if (!post) {
    throw new CustomError("Post was not found", 404);
  }

  const newComment = new Comment({
    user: req.user._id,
    desc,
    post: post._id,
    parent,
    replyOnUser,
  });

  const savedComment = await newComment.save();

  res.status(201).json(savedComment);
});

export const updateComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const { desc } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new CustomError("Comment was not found", 404);
  }

  comment.desc = desc || comment.desc;

  const savedComment = await comment.save();

  res.status(201).json(savedComment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const comment = await Comment.findOneAndDelete({ _id: commentId });

  await Comment.deleteMany({ parent: comment._id });

  if (!comment) {
    throw new CustomError("Comment was not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Comment was deleted successfully",
  });
});
