const Bot = require("../models/Bot");
const Farmer = require("../models/Farmer");
const Farm = require("../models/Farm");

const createFarm = async config => {
  const { username, oauthPw, channel } = config;

  const farmer = new Farmer({
    username: channel
  });

  await farmer.save();

  const farm = new Farm({
    farmer: farmer.id
  });

  await farm.save();

  const bot = new Bot({
    farm: farm.id,
    username,
    oauthPw,
    channel
  });

  await bot.save();
};

module.exports = { createFarm };
