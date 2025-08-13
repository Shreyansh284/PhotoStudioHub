/* File: src/api/models/Space.js */
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const spaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A space must have a name"],
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
    required: [true, "A space must belong to a client"],
  },
  shareableLink: {
    type: String,
    unique: true,
  },
  collections: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Collection",
    },
  ],
});

spaceSchema.pre("save", function (next) {
  if (!this.shareableLink) {
    this.shareableLink = nanoid(10);
  }
  next();
});

const Space = mongoose.model("Space", spaceSchema);
module.exports = Space;
