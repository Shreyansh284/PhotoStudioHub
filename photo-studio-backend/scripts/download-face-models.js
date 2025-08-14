/* File: scripts/download-face-models.js */
const fs = require("fs");
const path = require("path");
const https = require("https");

const MODELS_DIR = path.join(__dirname, "../src/models");
const MODEL_BASE_URL =
  "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";

const models = [
  "ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1",
  "ssd_mobilenetv1_model-shard2",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

// Ensure models directory exists
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download ${url}: ${response.statusCode}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          console.log(`Downloaded: ${path.basename(filepath)}`);
          resolve();
        });

        file.on("error", (err) => {
          fs.unlink(filepath, () => {}); // Delete incomplete file
          reject(err);
        });
      })
      .on("error", reject);
  });
}

async function downloadModels() {
  console.log("Downloading face-api.js models...");

  try {
    for (const model of models) {
      const url = `${MODEL_BASE_URL}/${model}`;
      const filepath = path.join(MODELS_DIR, model);

      // Skip if file already exists
      if (fs.existsSync(filepath)) {
        console.log(`Skipped: ${model} (already exists)`);
        continue;
      }

      await downloadFile(url, filepath);
    }

    console.log("All models downloaded successfully!");
  } catch (error) {
    console.error("Error downloading models:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadModels();
}

module.exports = downloadModels;
