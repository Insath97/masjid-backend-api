const { sequelize } = require("../models");
const logger = require("../config/winston");

const resetDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info("Database connected.");

        logger.warn("⚠️  Resetting database... ALL DATA WILL BE LOST!");

        // Force sync drops tables and recreates them
        await sequelize.sync({ force: true });

        logger.info("Database reset successfully.");
        process.exit(0);
    } catch (error) {
        logger.error("Database reset failed:", error);
        process.exit(1);
    }
};

resetDatabase();
