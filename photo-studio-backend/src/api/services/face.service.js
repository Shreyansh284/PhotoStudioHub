/* File: src/api/services/face.service.js */
const Collection = require("../models/Collection");
const Space = require("../models/Space");
const faceApiService = require("./faceapi.service");
const AppError = require("../utils/AppError");

/**
 * Process face recognition for a single photo
 */
const recognizeFacesInPhoto = async (spaceId, collectionId, photoId) => {
  try {
    const collection = await Collection.findOne({
      _id: collectionId,
      space: spaceId,
    });

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    const photo = collection.photos.id(photoId);
    if (!photo) {
      throw new AppError("Photo not found", 404);
    }

    // Skip if faces already detected
    if (photo.detectedFaces && photo.detectedFaces.length > 0) {
      console.log(`Faces already detected for photo ${photoId}`);
      return photo.detectedFaces;
    }

    console.log(`Processing face recognition for photo: ${photo.url}`);

    // Detect faces using face-api.js
    const detectedFaces = await faceApiService.detectFacesInImage(photo.url);

    // Update photo with detected faces
    photo.detectedFaces = detectedFaces;
    await collection.save();

    console.log(`Detected ${detectedFaces.length} faces in photo ${photoId}`);
    return detectedFaces;
  } catch (error) {
    console.error("Error in recognizeFacesInPhoto:", error);
    throw error;
  }
};

/**
 * Get all unique faces detected across all photos in a space
 */
const getAllFacesInSpace = async (spaceId) => {
  try {
    const space = await Space.findById(spaceId).populate({
      path: "collections",
      select: "photos",
    });

    if (!space) {
      throw new AppError("Space not found", 404);
    }

    // Collect all faces from all photos in all collections
    const allFaces = [];

    space.collections.forEach((collection) => {
      collection.photos.forEach((photo) => {
        if (photo.detectedFaces && photo.detectedFaces.length > 0) {
          photo.detectedFaces.forEach((face) => {
            allFaces.push({
              photoId: photo._id,
              photoPublicId: photo.public_id, // Use public_id for frontend matching
              photoUrl: photo.url,
              descriptor: face.descriptor,
              boundingBox: face.boundingBox,
              collectionId: collection._id,
            });
          });
        }
      });
    });

    if (allFaces.length === 0) {
      return [];
    }

    // Group faces by person (similarity)
    const groupedFaces = faceApiService.groupFacesByPerson(allFaces);

    // Format response for frontend
    const uniqueFaces = groupedFaces.map((group, index) => {
      // Create a cropped thumbnail URL for the representative face
      const representative = group.representative;
      const thumbnailUrl = createFaceThumbnailUrl(
        representative.photoUrl,
        representative.boundingBox
      );

      return {
        id: `face_${index}`,
        thumbnailUrl,
        photoCount: group.photoIds.length,
        photoIds: group.photoIds, // MongoDB IDs for internal use
        photoPublicIds: group.photoPublicIds, // Cloudinary public IDs for frontend
        representative: {
          photoId: representative.photoId,
          photoUrl: representative.photoUrl,
          boundingBox: representative.boundingBox,
        },
      };
    });

    return uniqueFaces;
  } catch (error) {
    console.error("Error in getAllFacesInSpace:", error);
    throw error;
  }
};

/**
 * Create a Cloudinary transformation URL for face thumbnail
 */
const createFaceThumbnailUrl = (photoUrl, boundingBox) => {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = photoUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");
    const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join("/");
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ""); // Remove extension

    // Calculate crop parameters
    const { left, top, width, height } = boundingBox;

    // Add some padding around the face (20% on each side)
    const padding = 0.2;
    const paddedLeft = Math.max(0, left - width * padding);
    const paddedTop = Math.max(0, top - height * padding);
    const paddedWidth = width * (1 + 2 * padding);
    const paddedHeight = height * (1 + 2 * padding);

    // Create Cloudinary transformation URL
    const baseUrl = photoUrl.substring(0, photoUrl.indexOf("/upload/") + 8);
    const transformations = [
      `c_crop`,
      `x_${Math.round(paddedLeft)}`,
      `y_${Math.round(paddedTop)}`,
      `w_${Math.round(paddedWidth)}`,
      `h_${Math.round(paddedHeight)}`,
      `c_thumb`,
      `w_150`,
      `h_150`,
      `g_face`,
      `r_max`,
    ].join(",");

    return `${baseUrl}${transformations}/${publicId}`;
  } catch (error) {
    console.error("Error creating face thumbnail URL:", error);
    // Fallback to original photo URL
    return photoUrl;
  }
};

/**
 * Process face recognition for all photos in a collection
 */
const processCollectionFaces = async (spaceId, collectionId) => {
  try {
    const collection = await Collection.findOne({
      _id: collectionId,
      space: spaceId,
    });

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    const results = [];

    // Process each photo in the collection
    for (const photo of collection.photos) {
      try {
        const faces = await recognizeFacesInPhoto(
          spaceId,
          collectionId,
          photo._id
        );
        results.push({
          photoId: photo._id,
          facesCount: faces.length,
          success: true,
        });
      } catch (error) {
        console.error(`Error processing photo ${photo._id}:`, error);
        results.push({
          photoId: photo._id,
          facesCount: 0,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in processCollectionFaces:", error);
    throw error;
  }
};

module.exports = {
  recognizeFacesInPhoto,
  getAllFacesInSpace,
  processCollectionFaces,
};
