/* File: src/api/services/collection.service.js */
const Collection = require("../models/Collection");
const Space = require("../models/Space");
const {
  uploadFromBuffer,
  deleteFromCloudinary,
} = require("../config/cloudinary");
const AppError = require("../utils/AppError");

exports.createCollection = async (collectionData) => {
  const collection = await Collection.create(collectionData);
  await Space.findByIdAndUpdate(collectionData.space, {
    $push: { collections: collection._id },
  });
  return collection;
};

exports.uploadPhotosToCollection = async (collectionId, files) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new AppError("No collection found with that ID", 404);
  }

  const uploadPromises = files.map((file) => uploadFromBuffer(file.buffer));
  const results = await Promise.all(uploadPromises);

  const photos = results.map((result) => ({
    url: result.secure_url,
    public_id: result.public_id,
  }));

  collection.photos.push(...photos);
  await collection.save();

  return collection;
};

exports.deletePhotoFromCollection = async (collectionId, photoPublicId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new AppError("No collection found with that ID", 404);
  }

  const photoExists = collection.photos.some(
    (photo) => photo.public_id === photoPublicId
  );
  if (!photoExists) {
    throw new AppError("No photo found with that ID in this collection", 404);
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(photoPublicId);

  // Remove from collection's photos array
  collection.photos = collection.photos.filter(
    (photo) => photo.public_id !== photoPublicId
  );
  await collection.save();

  return collection;
};

exports.deleteAllPhotosFromCollection = async (collectionId) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new AppError("No collection found with that ID", 404);
  }

  const photos = [...collection.photos];
  if (!photos.length) return collection;

  const results = await Promise.allSettled(
    photos.map((p) => deleteFromCloudinary(p.public_id))
  );

  // Keep any photos that failed to delete
  const failedIds = results
    .map((r, i) => (r.status === "rejected" ? photos[i].public_id : null))
    .filter(Boolean);

  if (failedIds.length) {
    collection.photos = collection.photos.filter((p) =>
      failedIds.includes(p.public_id)
    );
  } else {
    collection.photos = [];
  }

  await collection.save();
  return collection;
};

exports.updateCollection = async (id, collectionData) => {
  return await Collection.findByIdAndUpdate(id, collectionData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteCollection = async (id) => {
  return await Collection.findByIdAndDelete(id);
};

exports.getCollectionById = async (id) => {
  return await Collection.findById(id);
};
