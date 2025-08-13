/* File: src/api/routes/client.routes.js */
const express = require("express");
const clientController = require("../controllers/client.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router
  .route("/")
  .post(clientController.createClient)
  .get(clientController.getAllClients);

router
  .route("/:id")
  .get(clientController.getClient)
  .patch(clientController.updateClient)
  .delete(clientController.deleteClient);

module.exports = router;
