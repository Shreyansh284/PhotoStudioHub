/* File: src/api/routes/face.routes.js */
const express = require("express");
const faceController = require("../controllers/face.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router({ mergeParams: true });

// Public routes (for client gallery)
router.get("/spaces/:spaceId/faces", faceController.getAllFacesInSpace);

// Protected routes (admin only)
router.use(protect); // All routes below require authentication

router.post(
  "/spaces/:spaceId/collections/:collectionId/photos/:photoId/recognize-faces",
  faceController.recognizeFacesInPhoto
);

router.post(
  "/spaces/:spaceId/collections/:collectionId/process-faces",
  faceController.processCollectionFaces
);

module.exports = router;
