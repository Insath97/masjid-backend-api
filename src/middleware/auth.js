const logger = require("../config/winston");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Permission = require("../models/permission.model");
const { verifyToken } = require("../utils/jwt");
require("dotenv").config();

exports.authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        code: "AUTH_REQUIRED",
        message: "Access denied. No token provided.",
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid or expired token",
      });
    }

    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          include: [Permission],
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "User account not found or inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      code: "AUTH_FAILED",
      message: "Authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: "roles",
            through: { attributes: [] },
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] },
                attributes: ["name"],
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          code: "USER_NOT_FOUND",
          message: "User not found",
        });
      }

      const userPermissions = new Set();
      if (req.user.Roles) {
        req.user.Roles.forEach((role) => {
          if (role.Permissions) {
            role.Permissions.forEach((perm) => {
              userPermissions.add(perm.slug);
            });
          }
        });
      }

      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.has(perm)
      );

      if (!hasPermission) {
        logger.warn(
          `User ${user.id} lacks required permissions: ${requiredPermissions}`
        );
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "You do not have the required permissions",
        });
      }

      next();
    } catch (error) {
      logger.error("Authorization middleware error:", error);
      return res.status(500).json({
        success: false,
        code: "AUTHZ_FAILED",
        message: "Authorization check failed",
      });
    }
  };
};
