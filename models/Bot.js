const mongoose = require("mongoose");

const BotSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "farm",
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  oauthPw: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  }
});

module.exports = Bot = mongoose.model("bot", BotSchema);
