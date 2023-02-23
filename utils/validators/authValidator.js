const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddlware");
const User = require("../../models/userModel");

exports.signupValidator = [
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
  validatorMiddleware,
];
exports.loginValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Please enter a valid email address"),
  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters"),
  validatorMiddleware,
];
