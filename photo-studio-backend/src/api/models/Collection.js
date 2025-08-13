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
    },
  ],
});

const Collection = mongoose.model("Collection", collectionSchema);
module.exports = Collection;
