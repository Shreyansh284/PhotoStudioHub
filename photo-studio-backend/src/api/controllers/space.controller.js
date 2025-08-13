/* File: src/api/controllers/space.controller.js */
const spaceService = require("../services/space.service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createSpace = catchAsync(async (req, res, next) => {
  const space = await spaceService.createSpace(req.body);
  res.status(201).json({
    status: "success",
    data: {
      space,
    },
  });
});

exports.getSpace = catchAsync(async (req, res, next) => {
  const space = await spaceService.getSpaceById(req.params.spaceId);
  if (!space) {
    return next(new AppError("No space found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      space,
    },
  });
});

exports.updateSpace = catchAsync(async (req, res, next) => {
  const space = await spaceService.updateSpace(req.params.spaceId, req.body);
  if (!space) {
    return next(new AppError("No space found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      space,
    },
  });
});

exports.deleteSpace = catchAsync(async (req, res, next) => {
  const space = await spaceService.deleteSpace(req.params.spaceId);
  if (!space) {
    return next(new AppError("No space found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getPublicSpace = catchAsync(async (req, res, next) => {
  const space = await spaceService.getSpaceByShareableLink(
    req.params.shareableLink
  );
  if (!space) {
    return next(new AppError("No space found with that link", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      space,
    },
  });
});
