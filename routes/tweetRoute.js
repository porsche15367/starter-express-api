const express = require("express");

const {
  getAllUserTweets,
  createTweet,
} = require("../controllers/tweetController");
const { getLoggedUserData } = require("../controllers/userController");
// const {
//   getUserValidator,
//   createUserValidator,
//   updateUserValidator,
//   deleteUserValidator,
//   userPasswordValidator,
// } = require("../utils/validators/userValidator");

const {
  uploadTweetImage,
  resizeImage,
} = require("../middlewares/uploadMiddleware");

const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, getLoggedUserData);
router
  .route("/")
  .get(getAllUserTweets)
  .post(uploadTweetImage, resizeImage, createTweet);

module.exports = router;
