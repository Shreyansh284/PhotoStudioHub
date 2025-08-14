/* File: src/api/services/collection.service.js */
const Collection = require("../models/Collection");
const Space = require("../models/Space");
const {
  uploadFromBuffer,
  deleteFromCloudinary,
} = require("../config/cloudinary");
const AppError = require("../utils/AppError");
const faceService = require("./face.service");

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
    detectedFaces: [], // Initialize with empty faces array
  }));

  collection.photos.push(...photos);
  await collection.save();

  // Trigger face recognition for newly uploaded photos asynchronously
  // This runs in the background and doesn't block the response
  setImmediate(async () => {
    try {
      const spaceId = collection.space;
      for (const photo of photos) {
        const newPhotoId =
          collection.photos[
            collection.photos.length - photos.length + photos.indexOf(photo)
          ]._id;
        await faceService.recognizeFacesInPhoto(
          spaceId,
          collectionId,
          newPhotoId
        );
      }
      console.log(
        `Face recognition completed for ${photos.length} photos in collection ${collectionId}`
      );
    } catch (error) {
      console.error("Background face recognition failed:", error);
    }
  });

  return collection;
};

exports.addPhotosMetadata = async (collectionId, photosInput) => {
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    throw new AppError("No collection found with that ID", 404);
  }
  const photos = (photosInput || []).map((p) => ({
    url: p.url,
    public_id: p.public_id,
    detectedFaces: [], // Initialize with empty faces array
  }));
  collection.photos.push(...photos);
  await collection.save();

  // Trigger face recognition for newly added photos asynchronously
  setImmediate(async () => {
    try {
      const spaceId = collection.space;
      for (const photo of photos) {
        const newPhotoId =
          collection.photos[
            collection.photos.length - photos.length + photos.indexOf(photo)
          ]._id;
        await faceService.recognizeFacesInPhoto(
          spaceId,
          collectionId,
          newPhotoId
        );
      }
      console.log(
        `Face recognition completed for ${photos.length} photos in collection ${collectionId}`
      );
    } catch (error) {
      console.error("Background face recognition failed:", error);
    }
  });

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
