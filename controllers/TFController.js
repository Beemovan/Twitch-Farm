const Farm = require("../models/Farm");

class TFController {
  constructor(farmId, respond) {
    this.farm = null;
    this.loadFarm(farmId);
    this.respond = respond;
  }

  async loadFarm(farmId) {
    this.farm = await Farm.findById(farmId).populate();
  }

  processCommand(command) {
    const { target, cmdString, username } = command;

    switch (cmdString) {
      case "!help":
        this.processHelp(target, username);
        break;
      default:
        console.log(`Command unrecognized: ${cmdString}`);
    }
  }

  processHelp(target, username) {
    this.respond(target, `You don't need help yet, ${username}`);
  }
}

module.exports = TFController;
