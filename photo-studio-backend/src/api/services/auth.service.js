/* File: src/api/services/auth.service.js */
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const signToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT_SECRET is not set on the server", 500);
  }
  const expires = process.env.JWT_EXPIRES_IN || undefined; // e.g., '15m'
  return jwt.sign({ id }, secret, expires ? { expiresIn: expires } : undefined);
};

exports.login = async (email, password) => {
  console.log("Logging in user with email:", email);
  if (!email || !password) {
    throw new AppError("Please provide email and password!", 400);
  }

  const user = await User.findOne({ email }).select("+password");
  console.log("User found:", user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  return signToken(user._id);
};
