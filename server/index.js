const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middlewares/error.js");
const connectDB = require("./config/db.js");
const logger = require("./utils/logger.js");
const cookieParser = require("cookie-parser");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());

// Mount routers
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/employees", require("./routes/employeeRoute"));
app.use("/api/v1/work", require("./routes/workRoute"));

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
