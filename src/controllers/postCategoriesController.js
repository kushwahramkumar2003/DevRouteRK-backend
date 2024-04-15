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
  console.log("req arrived");
  const filter = req.query.searchKeyword;
  let where = {};
  if (filter) {
    where.title = { $regex: filter, $options: "i" };
  }
  let query = PostCategories.find(where);
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * pageSize;
  const total = await PostCategories.find(where).countDocuments();
  const pages = Math.ceil(total / pageSize);

  console.log("pages ", pages);

  res.header({
    "x-count": JSON.stringify(pages),
    "x-filter": filter,
    "x-totalPageCount": JSON.stringify(pages),
    "x-totalcount": JSON.stringify(total),
    "x-currentpage": JSON.stringify(page),
    "x-pagesize": JSON.stringify(pageSize),
    "Access-Control-Expose-Headers":
      "x-filter, x-totalCount, x-currentPage, x-pageSize, x-totalpagescount, x-count",
  });

  console.log(res.header);

  if (page > pages) {
    return res.json([]);
  }

  const result = await query
    .skip(skip)
    .limit(pageSize)
    .sort({ updatedAt: "desc" });

  return res.status(200).json(result);
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
