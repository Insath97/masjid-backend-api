const { sequelize } = require("../models");
const logger = require("../config/winston");
const seedPermissions = require("../seeders/permissions.seeder");
const seedAdmin = require("../seeders/admin.seeder");

const seed = async () => {
    try {
        // 1. Connect and Sync
        await sequelize.authenticate();
        logger.info("Database connected.");

        // Sync schema
        await sequelize.sync({ alter: true });
        logger.info("Database synced.");

        // 2. Seed Permissions First (Prerequisite for Admin Seeder)
        await seedPermissions();

        // 3. Run Admin Seeder (Role Creation + Permission Sync + User Creation)
        await seedAdmin();

        logger.info("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        logger.error("Seeding failed:", error);
        process.exit(1);
    }
};

seed();
