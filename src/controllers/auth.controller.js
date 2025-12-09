const { Op } = require("sequelize");
const logger = require("../config/winston");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Permission = require("../models/permission.model");
const bcrypt = require("bcryptjs");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const { setTokenCookies, clearTokenCookies } = require("../utils/cookies");

// Helper function to get token, set cookies and send response
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  setTokenCookies(res, accessToken, refreshToken);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message: "Login successful",
    token: accessToken,
    user,
  });
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
      attributes: { include: ["password"] },
      include: [
        {
          model: Role,
          attributes: ["id", "name", "slug"],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              through: { attributes: [] },
              attributes: ["id", "name", "slug", "group_name"],
            },
          ],
        },
      ],
      paranoid: false,
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.validatePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      logger.warn(`Inactive user tried to login: ${email}`);
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    logger.info(`User logged in: ${user.id}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error("Login Error:", error);
    next(error);
  }
};

exports.logout = (req, res, next) => {
  try {
    clearTokenCookies(res);
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    logger.error("Logout Error:", error);
    next(error);
  }
};
