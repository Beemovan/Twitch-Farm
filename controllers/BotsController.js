const tmi = require("tmi.js");
const TFController = require("./TFController");
const Bot = require("../models/Bot");

class BotsController {
  constructor() {
    this.bots = [];
    this.startAllBots();
  }
  async startAllBots() {
    const botsData = await Bot.find().lean();
    this.bots = botsData.map(bot => {
      // Define configuration options
      const opts = {
        options: { debug: true },
        connection: {
          reconnect: true,
          secure: true
        },
        identity: {
          username: bot.username,
          password: bot.oauthPw
        },
        channels: [bot.channel]
      };
      const client = new tmi.client(opts);
      const tFController = new TFController(
        bot.farm,
        this.respondToClient.bind(client)
      );

      // Create a client with our options
      return {
        tFController,
        client
      };
    });

    await this.connectBots();
  }

  async connectBots() {
    // Connect each client and attach handlers
    this.bots.forEach(bot => {
      // Register our event handlers (defined below)
      bot.client.on("message", this.onMessageHandler.bind(bot));
      bot.client.on("connected", this.onConnectedHandler.bind(bot));

      // Connect to Twitch:
      bot.client.connect();
    });
  }

  // Called every time a message comes in
  onMessageHandler(target, context, msg, self) {
    const command = {
      target,
      args: msg.trim().split(" "),
      username: context.username
    };

    if (command.args[0].charAt(0) === "!" && command.args[0].length > 1) {
      this.tFController.runCommand(command);
    }
  }

  // Called every time the bot connects to Twitch chat
  onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  respondToClient(target, response, isWhisper = false) {
    if (isWhisper) {
      this.whisper(target, response);
    } else {
      this.say(target, response);
    }
  }
}

module.exports = BotsController;
