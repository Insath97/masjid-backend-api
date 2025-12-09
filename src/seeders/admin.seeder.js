const Role = require("../models/role.model");
const Permission = require("../models/permission.model");
const User = require("../models/user.model");
const logger = require("../config/winston");

const seedAdmin = async () => {
  logger.info("Seeding Admin Role and User...");

  const [role, roleCreated] = await Role.findOrCreate({
    where: { slug: "super-admin" },
    defaults: {
      name: "Super Admin",
      slug: "super-admin",
      description: "Super Admin with all permissions",
    },
  });

  if (roleCreated) {
    logger.info("Super Admin role created.");
  } else {
    logger.info("Super Admin role already exists.");
  }

  const allPermissions = await Permission.findAll();
  await role.setPermissions(allPermissions);
  logger.info("All permissions assigned to Super Admin role.");

  const userData = {
    firstName: "Mohamed",
    lastName: "Insath",
    username: "insath9797",
    email: "mohamed.insath@mosque.com",
    password: "Admin@1234",
    userType: "SYSTEM",
    address: "123 Mosque Street",
    city: "Colombo",
    bio: "System administrator and mosque management lead",
    isActive: true,
  };

  const [user, userCreated] = await User.findOrCreate({
    where: { email: userData.email },
    defaults: userData,
  });

  if (userCreated) {
    logger.info(`User '${userData.firstName} ${userData.lastName}' created.`);
  } else {
    logger.info(`User '${userData.email}' already exists.`);
  }

  await user.addRole(role);
  logger.info("Assigned 'Super Admin' role to user.");
};

module.exports = seedAdmin;
