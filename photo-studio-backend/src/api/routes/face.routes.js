/* File: src/api/routes/face.routes.js */
const express = require("express");
const faceController = require("../controllers/face.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router({ mergeParams: true });


// Public routes (no auth needed)
router.get("/spaces/:spaceId/faces", faceController.getAllFacesInSpace);
router.post(
  "/spaces/:spaceId/collections/:collectionId/photos/:photoId/recognize-faces",
  faceController.recognizeFacesInPhoto
);
router.post(
  "/spaces/:spaceId/collections/:collectionId/process-faces",
  faceController.processCollectionFaces
);

// If you want to keep some routes protected, add them below:
// router.use(protect);

module.exports = router;
