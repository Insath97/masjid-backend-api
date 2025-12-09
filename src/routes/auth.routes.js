const express = require("express");
const router = express.Router();
const { loginSchema } = require("../validations/auth.validation");
const { handleValidationErrors } = require("../middleware/validation");
const { login, logout } = require("../controllers/auth.controller");

router.post("/login", loginSchema, handleValidationErrors, login);
router.post("/logout", logout);

module.exports = router;
