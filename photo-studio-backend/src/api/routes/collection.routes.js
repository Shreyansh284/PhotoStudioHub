/* File: src/api/routes/collection.routes.js */
const express = require("express");
const collectionController = require("../controllers/collection.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const router = express.Router({ mergeParams: true });

// Admin routes
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.route("/").post(collectionController.createCollection);

router
  .route("/:collectionId")
  .get(collectionController.getCollection)
  .patch(collectionController.updateCollection)
  .delete(collectionController.deleteCollection);

router
  .route("/:collectionId/photos")
  .post(uploadMiddleware.array("photos", 10), collectionController.uploadPhotos)
  .delete(collectionController.deleteAllPhotos);

// Direct-to-Cloudinary: append metadata
router
  .route("/:collectionId/photos/metadata")
  .post(collectionController.addPhotosMetadata);

router
  .route("/:collectionId/photos/:photoId")
  .delete(collectionController.deletePhoto);

module.exports = router;
