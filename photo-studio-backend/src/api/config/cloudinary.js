/* File: src/api/config/cloudinary.js */
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

let configured = false;
const ensureConfigured = () => {
  const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    const msg =
      "Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET) are not set";
    const err = new Error(msg);
    err.name = "CloudinaryConfigError";
    throw err;
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });
    configured = true;
  }
};

const uploadFromBuffer = (buffer) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: "photo-studio",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    const readStream = streamifier.createReadStream(buffer);
    readStream.on("error", reject);
    readStream.pipe(cld_upload_stream);
  });
};

const deleteFromCloudinary = (public_id) => {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  });
};

module.exports = { cloudinary, uploadFromBuffer, deleteFromCloudinary };
