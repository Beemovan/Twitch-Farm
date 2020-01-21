const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    default: "Farmer"
  },
  exp: {
    type: Number,
    required: true,
    default: 0
  },
  accessories: {
    tractor: {
      type: Number,
      required: true,
      default: 0
    },
    dog: {
      type: Number,
      required: true,
      default: 0
    },
    overalls: {
      type: Number,
      required: true,
      default: 0
    }
  }
});

module.exports = Farmer = mongoose.model("farmer", FarmerSchema);
