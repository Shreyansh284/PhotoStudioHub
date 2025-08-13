/* File: src/api/routes/space.routes.js */
const express = require("express");
const spaceController = require("../controllers/space.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const uploadMiddleware = require("../middlewares/upload.middleware");

const router = express.Router();

const collectionRouter = require("./collection.routes");

// Public route
router.get("/share/:shareableLink", spaceController.getPublicSpace);

// Nested route for collections
router.use("/:spaceId/collections", collectionRouter);

// Admin routes
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.route("/").post(spaceController.createSpace);

router
  .route("/:spaceId")
  .get(spaceController.getSpace)
  .patch(spaceController.updateSpace)
  .delete(spaceController.deleteSpace);

module.exports = router;
