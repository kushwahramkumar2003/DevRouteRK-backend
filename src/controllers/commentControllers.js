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
  const { desc, check } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new CustomError("Comment was not found", 404);
  }

  comment.desc = desc || comment.desc;
  comment.check = typeof check !== "undefined" ? check : comment.check;

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

export const getAllComments = asyncHandler(async (req, res) => {
  console.log("getAllComments");
  const filter = req.query.searchKeyword;

  let where = {};

  if (filter) {
    where.desc = {
      $regex: filter,
      $options: "i",
    };
  }

  let query = Comment.find(where);

  const page = parseInt(req.query.page) || 1;

  const pageSize = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * pageSize;

  const total = await Comment.find(where).countDocuments();
  const pages = Math.ceil(total / pageSize);

  res.header({
    "x-filter": filter,
    "x-totalCount": JSON.stringify(total),
    "x-currentPage": JSON.stringify(page),
    "x-pageSize": JSON.stringify(pageSize),
    "x-totalPagesCount": JSON.stringify(pages),
    "Access-Control-Expose-Headers":
      "x-filter, x-totalCount, x-currentPage, x-pageSize, x-totalPagesCount",
  });

  if (page > pages) {
    return res.json([]);
    // res.status(404);
    // throw new CustomError("Page not found", 404);
  }

  const result = await query
    .skip(skip)
    .limit(pageSize)
    .populate([
      {
        path: "user",
        select: ["name", "avatar", "verified"],
      },
      {
        path: "parent",
        populate: [
          {
            path: "user",
            select: ["name", "avatar", "verified"],
          },
        ],
      },
      {
        path: "replyOnUser",
        select: ["name", "avatar", "verified"],
      },
      {
        path: "post",
        select: ["title", "slug"],
      },
    ])
    .sort({ updatedAt: "desc" });

  return res.status(200).json(result);
});
