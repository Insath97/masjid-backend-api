const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");
const hpp = require("hpp");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const donenv = require("dotenv").config();

const port = process.env.PORT || 5000;
const app_url = process.env.APP_URL + ":" + port;
const logger = require("./src/config/winston");
const { httpLogger } = require("./src/middleware/logger");
const models = require("./src/models");
const errorHandler = require("./src/middleware/errorHandler");
const {
  sequelize,
  testConnection,
  syncDatabase,
} = require("./src/config/database");

// Import route files

const app = express();

// HTTP request logging
app.use(httpLogger);

// Security middleware
app.use(helmet());
app.use(hpp());

// Body parser
app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000"],
    credentials: true,
  })
);

// Routes

// Root endpoint
app.get("/", (req, res) => {
  res.send(`Welcome to Masjid API. Base URL: ${app_url}`);
});

// Health check
app.get("/api/health", (req, res) => {
  logger.debug("Health check requested");
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: app_url,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(port, async () => {
  logger.info(`Server running on port ${port}`);
  console.log(`Server running on port ${port}`);

  // Database connection
  await testConnection();
  await syncDatabase();
});
