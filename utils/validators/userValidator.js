const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddlware");
const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid User id"),
  validatorMiddleware,
];

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand name required")
    .isLength({ min: 3 })
    .withMessage("Too short Brand name"),
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Please enter a valid email address")
    .custom((val) =>
      User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email Already Exists"));
        }
      })
    ),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters")
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirmation is required"),
  check("phone").optional().isMobilePhone("ar-EG"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddleware,
];

exports.userPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  check("currentPassword")
    .notEmpty()
    .withMessage("you must enter your current password"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("you must enter your password confirmation"),
  check("password")
    .notEmpty()
    .withMessage("You must enter new password")
    .custom(async (password, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("There is no user for this id");
      }
      console.log(user.password, req.body.currentPassword);
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect password");
      }
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
    }),
  validatorMiddleware,
];

exports.deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id"),
  validatorMiddleware,
];
