const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class UserRole extends Model {}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserId: {
      type: DataTypes.UUID,
      references: {
        model: "users",
        key: "id",
      },
    },
    RoleId: {
      type: DataTypes.INTEGER,
      references: {
        model: "roles",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "UserRole",
    tableName: "user_roles",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = UserRole;
