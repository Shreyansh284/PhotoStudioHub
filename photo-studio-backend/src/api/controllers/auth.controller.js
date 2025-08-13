/* File: src/api/controllers/auth.controller.js */
const authService = require("../services/auth.service");
const catchAsync = require("../utils/catchAsync");

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const token = await authService.login(email, password);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.me = catchAsync(async (req, res, next) => {
  // req.user is set by protect middleware
  const user = req.user;
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    },
  });
});
