/* File: src/api/controllers/collection.controller.js */
const collectionService = require("../services/collection.service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createCollection = catchAsync(async (req, res, next) => {
  const collectionData = { ...req.body, space: req.params.spaceId };
  const collection = await collectionService.createCollection(collectionData);
  res.status(201).json({
    status: "success",
    data: {
      collection,
    },
  });
});

exports.uploadPhotos = catchAsync(async (req, res, next) => {
  const collection = await collectionService.uploadPhotosToCollection(
    req.params.collectionId,
    req.files
  );
  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

exports.deletePhoto = catchAsync(async (req, res, next) => {
  const { collectionId, photoId } = req.params;
  const collection = await collectionService.deletePhotoFromCollection(
    collectionId,
    photoId
  );
  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

exports.deleteAllPhotos = catchAsync(async (req, res, next) => {
  const { collectionId } = req.params;
  const collection = await collectionService.deleteAllPhotosFromCollection(
    collectionId
  );
  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

exports.getCollection = catchAsync(async (req, res, next) => {
  const collection = await collectionService.getCollectionById(
    req.params.collectionId
  );
  if (!collection) {
    return next(new AppError("No collection found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

exports.updateCollection = catchAsync(async (req, res, next) => {
  const collection = await collectionService.updateCollection(
    req.params.collectionId,
    req.body
  );
  if (!collection) {
    return next(new AppError("No collection found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      collection,
    },
  });
});

exports.deleteCollection = catchAsync(async (req, res, next) => {
  const collection = await collectionService.deleteCollection(
    req.params.collectionId
  );
  if (!collection) {
    return next(new AppError("No collection found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
