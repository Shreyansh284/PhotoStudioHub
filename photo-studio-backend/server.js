/* File: server.js */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/api/config/db");
const globalErrorHandler = require("./src/api/middlewares/errorHandler.middleware");
const AppError = require("./src/api/utils/AppError");
const seedAdmin = require("./src/api/utils/seedAdmin");
const mainRouter = require("./src/api/routes");

dotenv.config();

const app = express();

// Connect to database
connectDB().then(() => {
  seedAdmin();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1", mainRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
