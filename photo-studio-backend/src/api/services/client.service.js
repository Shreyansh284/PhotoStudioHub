/* File: src/api/services/client.service.js */
const Client = require("../models/Client");

exports.createClient = async (clientData) => {
  return await Client.create(clientData);
};

exports.getAllClients = async () => {
  return await Client.find().populate({
    path: "spaces",
    populate: {
      path: "collections",
      model: "Collection",
    },
  });
};

exports.getClientById = async (id) => {
  return await Client.findById(id).populate({
    path: "spaces",
    populate: {
      path: "collections",
      model: "Collection",
    },
  });
};

exports.updateClient = async (id, clientData) => {
  return await Client.findByIdAndUpdate(id, clientData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteClient = async (id) => {
  return await Client.findByIdAndDelete(id);
};
