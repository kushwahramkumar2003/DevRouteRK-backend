import asyncHandler from "../utils/asyncHandler.js";
import Post from "../models/Post.js";
import { v4 as uuidv4 } from "uuid";
import CustomError from "../utils/CustomError.js";
import uploadImageToCloudinary from "../utils/imageUploder.js";
import config from "../config/index.js";
import Comment from "../models/Comment.js";

export const createPost = asyncHandler(async (req, res) => {
  console.log("req : ", req);
  const post = new Post({
    title: "sample title",
    caption: "sample caption",
    slug: uuidv4(),
    body: {
      type: "doc",
      content: [],
    },
    photo: "",
    user: req.user._id,
  });
  const createdPost = await post.save();
  res.status(201).json(createdPost);
});

export const updatePost = asyncHandler(async (req, res) => {
  console.log("req.body : ", req.body);
  const post = await Post.findOne({ slug: req.params.slug });
  if (!post) {
    res.status(404);
    throw new CustomError("Post not found", 404);
  }

  if (req.files && req.files.postPicture) {
    const img = req.files.postPicture;

    if (!img) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    let uploadDetails = await uploadImageToCloudinary(img, config.FOLDER_NAME);
    console.log("upload details : " + uploadDetails);

    post.photo = uploadDetails.secure_url;

    console.log("Update data : ", req.body.document);

    const { title, caption, body, tags, categories ,slug} = JSON.parse(
      req.body.document
    );

    console.log("title : ", title);

    post.title = title || post.title;
    post.caption = caption || post.caption;
    post.body = body || post.body;
    post.tags = tags || post.tags;
    post.categories = categories || post.categories;
    post.slug = slug || post.slug;

    const updatedPost = await post.save({ new: true });

    res.json(updatedPost);
  } else {
    console.log("no image");
    post.photo = "";
    const { title, caption, body, tags, categories,slug } = JSON.parse(
      req.body.document
    );

    post.title = title || post.title;
    post.caption = caption || post.caption;
    post.body = body || post.body;
    post.tags = tags || post.tags;
    post.categories = categories || post.categories;
    post.slug = slug || post.slug;

    const updatedPost = await post.save();

    console.log("updatedPost : ", updatedPost);

    res.json(updatedPost);
  }
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndDelete({ slug: req.params.slug });
  if (!post) {
    res.status(404);
    throw new CustomError("Post not found", 404);
  }

  await Comment.deleteMany({ post: post._id });

  res.json({ message: "Post removed" });
});

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.findOne({ slug: req.params.slug }).populate([
    {
      path: "user",
      select: ["name", "avatar"],
    },
    {
      path: "categories",
      select: ["title"],
    },
    {
      path: "comments",
      match: {
        check: true,
        parent: null,
      },
      populate: [
        {
          path: "user",
          select: ["name", "avatar"],
        },
        {
          path: "replies",
          match: {
            check: true,
          },
          populate: [
            {
              path: "user",
              select: ["name", "avatar"],
            },
          ],
        },
      ],
    },
  ]);

  if (!posts) {
    res.status(404);
    throw new CustomError("Post not found", 404);
  }

  return res.json(posts);
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const filter = req.query.searchKeyword;

  let where = {};

  if (filter) {
    where.title = {
      $regex: filter,
      $options: "i",
    };
  }

  let query = Post.find(where).populate({
    path: "categories",
    select: ["title"],
  });

  const page = parseInt(req.query.page) || 1;

  const pageSize = parseInt(req.query.limit) || 10;

  const skip = (page - 1) * pageSize;

  const total = await Post.find(where)
    .populate({
      path: "categories",
      select: ["title"],
    })
    .countDocuments();
  const pages = Math.ceil(total / pageSize);

  res.header({
    "x-filter": filter,
    "x-totalCount": JSON.stringify(total),
    "x-currentPage": JSON.stringify(page),
    "x-pageSize": JSON.stringify(pageSize),
    "x-totalPagesCount": JSON.stringify(pages),
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
    ])
    .sort({ updatedAt: "desc" });

  return res.status(200).json(result);
});
