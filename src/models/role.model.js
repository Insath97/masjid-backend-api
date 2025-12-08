const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const slugify = require("slugify");

class Role extends Model {
  static associate(models) {
    Role.belongsToMany(models.Permission, { through: models.RolePermission });
    Role.belongsToMany(models.User, { through: models.UserRole });
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Role name is required",
        },
      },
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Role;
