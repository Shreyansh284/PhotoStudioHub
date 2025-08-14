/* File: src/api/controllers/face.controller.js */
const faceService = require("../services/face.service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * POST /api/v1/spaces/:spaceId/collections/:collectionId/photos/:photoId/recognize-faces
 * Trigger face recognition for a single photo
 */
exports.recognizeFacesInPhoto = catchAsync(async (req, res, next) => {
  const { spaceId, collectionId, photoId } = req.params;

  const faces = await faceService.recognizeFacesInPhoto(
    spaceId,
    collectionId,
    photoId
  );

  res.status(200).json({
    status: "success",
    data: {
      photoId,
      facesDetected: faces.length,
      faces,
    },
  });
});

/**
 * GET /api/v1/spaces/:spaceId/faces
 * Get all unique faces detected across all photos in a space
 */
exports.getAllFacesInSpace = catchAsync(async (req, res, next) => {
  const { spaceId } = req.params;

  const faces = await faceService.getAllFacesInSpace(spaceId);

  res.status(200).json({
    status: "success",
    results: faces.length,
    data: {
      faces,
    },
  });
});

/**
 * POST /api/v1/spaces/:spaceId/collections/:collectionId/process-faces
 * Process face recognition for all photos in a collection
 */
exports.processCollectionFaces = catchAsync(async (req, res, next) => {
  const { spaceId, collectionId } = req.params;

  const results = await faceService.processCollectionFaces(
    spaceId,
    collectionId
  );

  const totalPhotos = results.length;
  const successfulProcessing = results.filter((r) => r.success).length;
  const totalFacesDetected = results.reduce((sum, r) => sum + r.facesCount, 0);

  res.status(200).json({
    status: "success",
    data: {
      collectionId,
      summary: {
        totalPhotos,
        successfulProcessing,
        totalFacesDetected,
      },
      results,
    },
  });
});

module.exports = {
  recognizeFacesInPhoto: exports.recognizeFacesInPhoto,
  getAllFacesInSpace: exports.getAllFacesInSpace,
  processCollectionFaces: exports.processCollectionFaces,
};
