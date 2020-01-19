const mongoose = require("mongoose");

const FarmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "A New Twitch Farm"
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "farmer",
    required: true
  },
  animals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "animal",
      required: true,
      default: []
    }
  ],
  accomodations: {
    pig: {
      type: Number,
      required: true,
      default: 0
    },
    sheep: {
      type: Number,
      required: true,
      default: 0
    },
    chicken: {
      type: Number,
      required: true,
      default: 0
    },
    cow: {
      type: Number,
      required: true,
      default: 0
    },
    goat: {
      type: Number,
      required: true,
      default: 0
    }
  },
  resources: {
    bacon: {
      type: Number,
      required: true,
      default: 0
    },
    wool: {
      type: Number,
      required: true,
      default: 0
    },
    eggs: {
      type: Number,
      required: true,
      default: 0
    },
    milk: {
      type: Number,
      required: true,
      default: 0
    },
    poems: {
      type: Number,
      required: true,
      default: 0
    }
  },
  materials: {
    wood: {
      type: Number,
      required: true,
      default: 0
    },
    brick: {
      type: Number,
      required: true,
      default: 0
    },
    iron: {
      type: Number,
      required: true,
      default: 0
    }
  },
  dingles: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = Farm = mongoose.model("farm", FarmSchema);
