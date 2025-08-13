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
