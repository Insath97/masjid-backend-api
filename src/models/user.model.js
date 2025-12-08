const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

class User extends Model {
  static associate(models) {
    User.belongsToMany(models.Role, { through: models.UserRole });
  }

  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  get fullName() {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      comment: "Unique identifier for administrative user",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "Email already in use",
      },
      validate: {
        isEmail: {
          msg: "Invalid email format",
        },
        notEmpty: {
          msg: "Email is required",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("email", value.trim().toLowerCase());
        }
      },
    },
    userType: {
      type: DataTypes.ENUM("SYSTEM", "COMMON"),
      defaultValue: "COMMON",
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: "Username is already taken",
      },
      validate: {
        notEmpty: {
          msg: "Username is required",
        },
        len: {
          args: [3, 50],
          msg: "Username must be between 3 and 50 characters",
        },
        is: {
          args: /^[a-zA-Z0-9_.-]+$/,
          msg: "Username can only contain letters, numbers, dots, hyphens, and underscores",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("username", value.trim().toLowerCase());
        }
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password is required",
        },
        len: {
          args: [8, 255],
          msg: "Password must be at least 8 characters long",
        },
        isStrongPassword(value) {
          const strongPasswordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
          if (!strongPasswordRegex.test(value)) {
            throw new Error(
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
            );
          }
        },
      },
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [1, 50],
          msg: "First name must be between 1 and 50 characters",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("firstName", value.trim());
        }
      },
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [1, 50],
          msg: "Last name must be between 1 and 50 characters",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("lastName", value.trim());
        }
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastPasswordChange: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
          user.lastPasswordChange = new Date();
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
          user.lastPasswordChange = new Date();
        }
      },
    },
  }
);

module.exports = User;
