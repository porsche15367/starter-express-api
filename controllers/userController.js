const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const ApiError = require("../utils/apiErrors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getUsers = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const users = await User.find({}).skip(skip).limit(limit);
  res.status(200).json({ result: users.length, page: page, data: users });
});

exports.getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new ApiError(`No user found for this ${id}`, 404));
  }
  res.status(200).json({ result: user });
});

exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ data: user });
});

exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      profileImage: req.body.profileImage,
      role: req.body.role,
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No user found for this ${id}`, 404));
  }
  res.status(200).json({ result: user });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  if (!user) {
    return next(new ApiError(`No user found for this ${id}`, 404));
  }
  res.status(200).json({ result: user });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new ApiError(`No user found for this ${id}`, 404));
  }
  res.status(200).json({ result: user });
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPasswords = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });

  res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updatedUser });
});
