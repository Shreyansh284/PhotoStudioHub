/* File: src/api/routes/index.js */
const express = require("express");
const authRoutes = require("./auth.routes");
const clientRoutes = require("./client.routes");
const spaceRoutes = require("./space.routes");

const collectionRoutes = require("./collection.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/clients", clientRoutes);
router.use("/spaces", spaceRoutes);
router.use("/collections", collectionRoutes);

module.exports = router;
