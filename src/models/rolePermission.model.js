const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class RolePermission extends Model {}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    RoleId: {
      type: DataTypes.INTEGER,
      references: {
        model: "roles",
        key: "id",
      },
    },
    PermissionId: {
      type: DataTypes.INTEGER,
      references: {
        model: "permissions",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "RolePermission",
    tableName: "role_permissions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = RolePermission;
