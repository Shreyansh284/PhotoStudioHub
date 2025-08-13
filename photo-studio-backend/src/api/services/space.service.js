/* File: src/api/services/space.service.js */
const Space = require("../models/Space");
const Client = require("../models/Client");
const { uploadFromBuffer } = require("../config/cloudinary");
const AppError = require("../utils/AppError");

exports.createSpace = async (spaceData) => {
  const space = await Space.create(spaceData);
  await Client.findByIdAndUpdate(spaceData.client, {
    $push: { spaces: space._id },
  });
  return space;
};

exports.updateSpace = async (id, spaceData) => {
  return await Space.findByIdAndUpdate(id, spaceData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteSpace = async (id) => {
  return await Space.findByIdAndDelete(id);
};

exports.getSpaceById = async (id) => {
  return await Space.findById(id).populate("client");
};

exports.getSpaceByShareableLink = async (shareableLink) => {
  return await Space.findOne({ shareableLink })
    .populate({
      path: "client",
      select: "name email",
    })
    .populate({
      path: "collections",
      select: "name photos",
    });
};
