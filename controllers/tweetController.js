const asyncHandler = require("express-async-handler");
const Tweet = require("../models/tweetModel");
const ApiError = require("../utils/apiErrors");

exports.getAllTweets = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const tweets = await Tweet.find({}).skip(skip).limit(limit);
  res.status(200).json({ result: tweets.length, page: page, data: tweets });
});

exports.getAllUserTweets = asyncHandler(async (req, res, next) => {
  const userTweets = await Tweet.find({ user: req.user._id });
  if (!userTweets) {
    return next(new ApiError(`No tweets found for this user`, 404));
  }
  res.status(200).json({ result: userTweets });
});

exports.createTweet = asyncHandler(async (req, res) => {
  const { tweetText, tweetImage } = req.body;
  const tweet = await Tweet.create({
    tweetText,
    tweetImage,
    user: req.user._id,
  });
  res.status(201).json({ data: tweet });
});
