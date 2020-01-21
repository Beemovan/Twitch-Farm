const mongoose = require("mongoose");

const AnimalSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    default: 0
  },
  exp: {
    type: Number,
    required: true,
    default: 0
  },
  lastActive: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = Animal = mongoose.model("animal", AnimalSchema);
