/* File: src/api/controllers/client.controller.js */
const clientService = require("../services/client.service");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createClient = catchAsync(async (req, res, next) => {
  const client = await clientService.createClient(req.body);
  res.status(201).json({
    status: "success",
    data: {
      client,
    },
  });
});

exports.getAllClients = catchAsync(async (req, res, next) => {
  const clients = await clientService.getAllClients();
  res.status(200).json({
    status: "success",
    results: clients.length,
    data: {
      clients,
    },
  });
});

exports.getClient = catchAsync(async (req, res, next) => {
  const client = await clientService.getClientById(req.params.id);
  if (!client) {
    return next(new AppError("No client found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      client,
    },
  });
});

exports.updateClient = catchAsync(async (req, res, next) => {
  const client = await clientService.updateClient(req.params.id, req.body);
  if (!client) {
    return next(new AppError("No client found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      client,
    },
  });
});

exports.deleteClient = catchAsync(async (req, res, next) => {
  const client = await clientService.deleteClient(req.params.id);
  if (!client) {
    return next(new AppError("No client found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
