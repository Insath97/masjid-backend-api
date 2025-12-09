const Permission = require("../models/permission.model");
const logger = require("../config/winston");

const permissions = [
  // User Management
  {
    name: "Create User",
    group_name: "User Management",
    description: "Can create new users",
  },
  {
    name: "View User",
    group_name: "User Management",
    description: "Can view user details",
  },
  
];

const seedPermissions = async () => {
  logger.info("Seeding Permissions...");
  const createdPermissions = [];

  for (const perm of permissions) {
    // Model hook handles slug generation from name
    const [instance] = await Permission.findOrCreate({
      where: { name: perm.name },
      defaults: perm,
    });
    createdPermissions.push(instance);
  }

  return createdPermissions;
};

module.exports = seedPermissions;
