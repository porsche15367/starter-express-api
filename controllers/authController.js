const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiErrors");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });

  res.status(200).json({ data: user, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || (await bcrypt.compare(user.password, req.body.password))) {
    return next(new ApiError("Incorrect email or password", 410));
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });

  res.status(200).json({ data: user, token });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }

  if (!token) {
    return next(
      new ApiError("You are not logged in to get access to this route", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }
  if (currentUser.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passwordChangedTimeStamp > decoded.iat) {
      return next(
        new ApiError("User changed password, please login again !", 401)
      );
    }
  }

  req.user = currentUser;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler((req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  console.log(req.body.email);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with this email ${req.body.email}`, 404)
    );
  }
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetCode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();
  const message = `Hello ${user.name}, \n We received request to reset password on your account. \n ${resetCode} \n Thanks for keeping your email secured`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password has been reset (valid for 10 min)",
      message,
    });
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(
      new ApiError("there is an error sending your password reset", 500)
    );
  }
  res.status(200).json({
    status: "Success",
    message: "Reset code sent to the email address",
  });
});

exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset Code is invalid or expired"));
  }

  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({
    status: "success",
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new ApiError(`there is no user with email: ${req.body.email}`, 404)
    );
  }
  if (!user.passwordResetVerified) {
    return next(new ApiError("Reset code is not verfied", 400));
  }
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });
  res.status(200).json({ token });
});
