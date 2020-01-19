const connectDB = require("./config/db");
const BotsController = require("./controllers/BotsController");
const { createFarm } = require("./util/helpers");

const start = async () => {
  // Connect Database
  await connectDB();

  // Start up and connect Twitch bots
  botsController = new BotsController();
};

start();

// createFarm({
//   username: "",
//   oauthPw: "",
//   channel: ""
// });
