const Farm = require("../models/Farm");
const animalTypes = ["Pig", "Sheep", "Chicken", "Cow", "Goat"];
const animalInfoMap = {
  pig: {
    noise: "oink",
    product: "bacon"
  },
  sheep: {
    noise: "bah",
    product: "wool"
  },
  chicken: {
    noise: "bok",
    product: "eggs"
  },
  cow: {
    noise: "moo",
    product: "milk"
  },
  goat: {
    noise: "bleh",
    product: "poems"
  }
};

class TFController {
  constructor(farmId, respond) {
    this.farm = null;
    this.loadFarm(farmId);
    this.respond = respond;
    this.roundsLeft = 0;
    this.roundsInterval = null;
    this.productionMap = {
      pig: {
        isProducing: false,
        animalsProduced: [],
        units: 0
      },
      sheep: {
        isProducing: false,
        animalsProduced: [],
        units: 0
      },
      chicken: {
        isProducing: false,
        animalsProduced: [],
        units: 0
      },
      cow: {
        isProducing: false,
        animalsProduced: [],
        units: 0
      },
      goat: {
        isProducing: false,
        animalsProduced: [],
        units: 0
      }
    };
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
      case "!makerounds":
        this.processMakerounds(target, username);
        break;
      case "!oink":
        this.processAnimalNoise("pig", username);
        break;
      case "!bah":
        this.processAnimalNoise("sheep", username);
        break;
      case "!bok":
        this.processAnimalNoise("chicken", username);
        break;
      case "!moo":
        this.processAnimalNoise("cow", username);
        break;
      case "!bleh":
        this.processAnimalNoise("goat", username);
        break;
      default:
        console.log(`Command unrecognized: ${cmdString}`);
    }
  }

  processHelp(target, username) {
    this.respond(target, `You don't need help yet, ${username}`);
  }

  processMakerounds(target, username) {
    if (username === this.farm.farmer.username) {
      if (this.roundsLeft > 0) {
        this.respond(username, "You're already making rounds!", true);
      } else {
        this.respond(
          target,
          `${this.farm.farmer.title} ${username} will visit each animal every 10-15 minutes for the next hour.`
        );
        this.roundsLeft = 6;
        this.roundsInterval = setInterval(() => {
          if (this.roundsLeft-- > 0) {
            animalTypes.forEach(type => {
              const oneToFive = Math.floor(Math.random() * 5) + 1;
              setTimeout(
                () => this.visitAnimal(type, target),
                1000 * 60 * oneToFive
              );
            });
          } else {
            clearInterval(this.roundsInterval);
          }
        }, 1000 * 60 * 10);
      }
    } else {
      this.respond(username, "Sorry, only the farmer can make rounds.", true);
    }
  }

  visitAnimal(type, target) {
    const { noise, product } = animalInfoMap[type];
    this.productionMap[type].isProducing = true;

    this.farm.animals
      .filter(animal => animal.type === type)
      .forEach(animal => {
        this.respond(
          animal.username,
          `You are being visited by ${this.farm.farmer.title} ${username}! You can type !${noise} in the next 30 seconds to produce some ${product}.`,
          true
        );
      });

    this.setTimeout(() => this.endVisit(type, target), 1000 * 30);
  }

  async endVisit(type, target) {
    const prodData = this.productionMap[type];
    this.respond(
      target,
      `${prodData.units} units of ${animalInfoMap[type].product} were produced${
        prodData.units > 0
          ? " thanks to: " + prodData.animalsProduced.join(" ")
          : "."
      }`
    );
    prodData.isProducing = false;
    this.farm.resources[animalInfoMap[type].product] += prodData.units;
    prodData.animalsProduced = [];
    prodData.units = 0;
    await this.farm.save();
  }

  processAnimalNoise(type, username) {
    if (!this.productionMap[type].animalsProduced.includes(username)) {
      const curAnimal = this.farm.animals.find(
        animal => animal.type === type && animal.username === username
      );
      if (!!curAnimal) {
        this.productionMap[type].animalsProduced.push(username);
        this.productionMap[type].units += this.calcUnitsProduced(curAnimal);
      } else {
        this.respond(
          username,
          `Sorry, only ${type}s can !${animalInfoMap[type].noise}.`,
          true
        );
      }
    } else {
      this.respond(
        username,
        `Woa there.. You can !${animalInfoMap[type].noise} once per round.`,
        true
      );
    }
  }

  calcUnitsProduced(animal) {
    return 1 + this.farm.accomodations[animal.type] + animal.level;
  }
}

module.exports = TFController;
