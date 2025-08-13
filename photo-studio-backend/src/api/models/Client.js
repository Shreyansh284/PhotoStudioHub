/* File: src/api/models/Client.js */
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A client must have a name"],
  },
  email: {
    type: String,
    required: [true, "A client must have an email"],
    unique: true,
    lowercase: true,
  },
  spaces: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Space",
    },
  ],
});

const Client = mongoose.model("Client", clientSchema);
module.exports = Client;
