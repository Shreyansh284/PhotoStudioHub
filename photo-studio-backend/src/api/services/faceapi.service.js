/* File: src/api/services/faceapi.service.js */
const faceapi = require("face-api.js");
const { Canvas, Image, ImageData } = require("canvas");
const axios = require("axios");
const path = require("path");

// Initialize face-api.js with canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

/**
 * Load face-api.js models (required before using face detection)
 */
const loadModels = async () => {
  if (modelsLoaded) return;

  try {
    // Use local model files
    const MODEL_PATH = path.join(__dirname, "../../models");

    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH),
      faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH),
    ]);

    modelsLoaded = true;
    console.log("Face-API models loaded successfully");
  } catch (error) {
    console.error("Error loading face-api.js models:", error);

    // Fallback to loading from CDN if local models fail
    try {
      console.log("Attempting to load models from CDN...");
      const MODEL_URL =
        "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      modelsLoaded = true;
      console.log("Face-API models loaded successfully from CDN");
    } catch (cdnError) {
      console.error("Failed to load models from CDN:", cdnError);
      throw new Error("Failed to load face recognition models");
    }
  }
};

/**
 * Load image from URL and convert to Canvas
 */
const loadImageFromUrl = async (imageUrl) => {
  try {
    console.log("Loading image from URL:", imageUrl);
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000, // 30 seconds timeout
    });

    console.log("Image loaded, size:", response.data.byteLength, "bytes");

    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => {
        console.log(
          "Image decoded successfully, dimensions:",
          img.width,
          "x",
          img.height
        );
        resolve(img);
      };
      img.onerror = (error) => {
        console.error("Image decode error:", error);
        reject(error);
      };
      img.src = Buffer.from(response.data);
    });
  } catch (error) {
    console.error("Error loading image from URL:", imageUrl, error.message);
    throw new Error(`Failed to load image from URL: ${imageUrl}`);
  }
};

/**
 * Detect faces in an image and return descriptors with bounding boxes
 */
const detectFacesInImage = async (imageUrl) => {
  try {
    console.log("Starting face detection for:", imageUrl);
    await loadModels();

    const img = await loadImageFromUrl(imageUrl);

    console.log("Running face detection...");
    // Detect faces with landmarks and descriptors
    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log(
      "Face detection complete. Found",
      detections ? detections.length : 0,
      "faces"
    );

    if (!detections || detections.length === 0) {
      console.log("No faces detected in image");
      return [];
    }

    // Convert detections to our format
    const faces = detections.map((detection, index) => {
      console.log(`Processing face ${index + 1}:`, {
        box: detection.detection.box,
        score: detection.detection.score,
      });

      return {
        descriptor: Array.from(detection.descriptor), // Convert Float32Array to regular array
        boundingBox: {
          width: detection.detection.box.width,
          height: detection.detection.box.height,
          left: detection.detection.box.left,
          top: detection.detection.box.top,
        },
      };
    });

    console.log(`Successfully processed ${faces.length} faces`);
    return faces;
  } catch (error) {
    console.error("Error detecting faces in image:", error);
    throw error;
  }
};

/**
 * Calculate Euclidean distance between two face descriptors
 */
const calculateDistance = (descriptor1, descriptor2) => {
  if (
    !descriptor1 ||
    !descriptor2 ||
    descriptor1.length !== descriptor2.length
  ) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
};

/**
 * Group face descriptors by similarity (same person)
 * Returns array of groups, each containing similar faces
 */
const groupFacesByPerson = (allFaces, threshold = 0.6) => {
  if (!allFaces || allFaces.length === 0) {
    return [];
  }

  const groups = [];
  const processed = new Set();

  allFaces.forEach((face, index) => {
    if (processed.has(index)) return;

    const group = {
      representative: face,
      photoIds: [face.photoId],
      photoPublicIds: [face.photoPublicId],
      descriptors: [face.descriptor],
    };

    // Find all similar faces
    for (let i = index + 1; i < allFaces.length; i++) {
      if (processed.has(i)) continue;

      const distance = calculateDistance(
        face.descriptor,
        allFaces[i].descriptor
      );
      if (distance < threshold) {
        group.photoIds.push(allFaces[i].photoId);
        group.photoPublicIds.push(allFaces[i].photoPublicId);
        group.descriptors.push(allFaces[i].descriptor);
        processed.add(i);
      }
    }

    groups.push(group);
    processed.add(index);
  });

  return groups;
};

module.exports = {
  loadModels,
  detectFacesInImage,
  calculateDistance,
  groupFacesByPerson,
};
