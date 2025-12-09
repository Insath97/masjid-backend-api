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
      validate: {
        notEmpty: { msg: "Permission name is required" },
      },
      set(value) {
        const trimmed = value.trim();
        this.setDataValue("name", trimmed);
        // Always regenerate slug when name changes
        this.setDataValue(
          "slug",
          slugify(trimmed, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
          })
        );
      },
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: { msg: "This slug is already in use" },
      validate: {
        is: { args: /^[a-z0-9-]+$/, msg: "Invalid slug format" },
        notEmpty: true,
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
    hooks: {
      beforeValidate: (permission) => {
        if (permission.changed("name") || !permission.slug) {
          permission.slug = slugify(permission.name || "", {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
          });
        }
      },
    },
  }
);

module.exports = Permission;
