/* File: src/api/models/Collection.js */
const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A collection must have a name"],
  },
  space: {
    type: mongoose.Schema.ObjectId,
    ref: "Space",
    required: [true, "A collection must belong to a space"],
  },
  photos: [
    {
      url: String,
      public_id: String,
      detectedFaces: [
        {
          // The 128-point vector that uniquely identifies a face
          descriptor: { type: [Number], required: true },
          boundingBox: {
            // Coordinates of the face in the photo
            width: { type: Number },
            height: { type: Number },
            left: { type: Number },
            top: { type: Number },
          },
        },
      ],
    },
  ],
});

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
