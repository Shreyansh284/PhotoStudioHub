/* File: src/api/routes/index.js */
const express = require("express");
const authRoutes = require("./auth.routes");
const clientRoutes = require("./client.routes");
const spaceRoutes = require("./space.routes");
const { getSignature } = require("../controllers/upload.controller");
const auth = require("../middlewares/auth.middleware");

const collectionRoutes = require("./collection.routes");
const faceRoutes = require("./face.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ status: "ok", message: "API root" });
});

router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/spaces", spaceRoutes);
router.use("/collections", collectionRoutes);
router.use("/", faceRoutes); // Face routes are mounted at root level

// Upload signature (admin only)
router.post(
  "/uploads/signature",
  auth.protect,
  auth.restrictTo("admin"),
  getSignature
);

module.exports = router;
