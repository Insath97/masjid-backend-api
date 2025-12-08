const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const slugify = require("slugify");

class Permission extends Model {
  static associate(models) {
    Permission.belongsToMany(models.Role, { through: models.RolePermission });
  }
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    group_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Group name is required",
        },
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { notEmpty: { msg: "Permission name is required" } },
      set(value) {
        if (value) {
          this.setDataValue(
            "name",
            slugify(value, { lower: true, strict: true })
          );
        }
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Permission",
    tableName: "permissions",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Permission;
