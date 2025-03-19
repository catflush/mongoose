import asyncHandler from "../utils/asyncHandler.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import client from "../db/index.js";
import { ObjectId } from "mongodb";
import Post from "../models/Post.js";

const databaseName = "blog";
const collectionName = "posts";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().populate("author", "firstName lastName");
  res.status(200).json(posts);
});

export const createPost = asyncHandler(async (req, res) => {
  const {
    body: { title, content, author },
  } = req;
  if (!title || !content || !author)
    throw new ErrorResponse("Please provide all required fields", 400);
  const post = await Post.create({ title, content, author });
  const postWithAuthor = await post.populate("author", "firstName lastName");
  res.status(201).json(postWithAuthor);
});

export const getPostById = asyncHandler(async (req, res) => {
  const {
    params: { id },
  } = req;
  const objectID = ObjectId.createFromHexString(id);
  const [post] = await client
    .db(databaseName)
    .collection(collectionName)
    .aggregate([
      {
        $match: { _id: objectID },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          user: {
            _id: 1,
            firstName: 1,
            lastName: 1,
          },
        },
      },
    ])
    .toArray();
  if (!post) throw new ErrorResponse("Post not found", 404);
  res.status(200).json(post);
});

export const updatePost = asyncHandler(async (req, res) => {
  const {
    body: { title, content, author },
    params: { id },
  } = req;
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    { title, content, author },
    { new: true }
  );
  if (!updatedPost) throw new ErrorResponse("Post not found", 404);
  const postWithAuthor = await updatedPost.populate(
    "author",
    "firstName lastName"
  );
  res.status(200).json(postWithAuthor);
});

export const deletePost = asyncHandler(async (req, res) => {
  const {
    params: { id },
  } = req;
  const post = await Post.findByIdAndDelete(id);
  if (!post) throw new ErrorResponse("Post not found", 404);
  res.status(200).json({ message: "Post deleted successfully" });
});
