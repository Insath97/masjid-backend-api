const { body } = require("express-validator");

const loginSchema = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  loginSchema,
};
