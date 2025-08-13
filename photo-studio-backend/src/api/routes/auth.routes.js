/* File: src/api/routes/auth.routes.js */
const express = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", authMiddleware.protect, authController.me);

module.exports = router;
