const express = require("express");

const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPasswords,
  updateLoggedUserData,
} = require("../controllers/userController");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  userPasswordValidator,
} = require("../utils/validators/userValidator");

const {
  uploadCategoryImage,
  resizeImage,
} = require("../middlewares/uploadMiddleware");

const authController = require("../controllers/authController");

const router = express.Router();

router.get("/getMe", authController.protect, getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",
  authController.protect,
  updateLoggedUserPasswords
);
router.put("/updateMe", authController.protect, updateLoggedUserData);

router.use(
  authController.protect,
  authController.allowedTo("admin", "manager")
);

router.route("/").get(getUsers).post(createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);
router.put("/changePassword/:id", userPasswordValidator, changeUserPassword);

module.exports = router;
