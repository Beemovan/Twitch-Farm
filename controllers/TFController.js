const Farm = require("../models/Farm");
const Animal = require("../models/Animal");

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
animalLevelMap = {
  0: "adolescent",
  1: "adult",
  2: "wisened",
  3: "ancient",
  4: "eternal"
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
    this.farm = await Farm.findById(farmId).populate("farmer animals");
  }

  runCommand(command) {
    const { target, args, username } = command;

    switch (args[0]) {
      case "!help":
        this.processHelp(username);
        break;
      case "!namefarm":
        this.processNameFarm(args.slice(1).join(" "), target, username);
        break;
      case "!makerounds":
        this.processMakerounds(target, username);
        break;
      case "!inventory":
        this.processInventory(target, username);
        break;
      case "!livestock":
        this.processLivestock(target, username);
        break;
      case "!evolve":
        this.processEvolve(target, username);
        break;
      case "!birthpig":
        this.processNewAnimal("pig", target, username);
        break;
      case "!birthsheep":
        this.processNewAnimal("sheep", target, username);
        break;
      case "!birthchicken":
        this.processNewAnimal("chicken", target, username);
        break;
      case "!birthcow":
        this.processNewAnimal("cow", target, username);
        break;
      case "!birthgoat":
        this.processNewAnimal("goat", target, username);
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
        console.log(`Command unrecognized: ${args[0]}`);
    }
  }

  processHelp(username) {
    if (username === this.farm.farmer.username) {
      this.respond(
        username,
        `Howdy, ${this.farm.farmer.title} ${username}! In order to interact with your Twitch Farm, you can use the following commands: '!namefarm [name]' will rename your farm. '!makerounds' will work the farm for an hour; if your animals are awake they'll produce resources during this time. '!inventory' will display what y'all got to work with. !livestock will display how many of each animal you own.`
      );
    }
  }

  processInventory(target, username) {
    if (username === this.farm.farmer.username) {
      this.respond(
        target,
        `${this.farm.name} has: ${this.farm.dingles} dingles, ${this.farm.resources.bacon} pounds of bacon, ${this.farm.resources.wool} bolts of wool, ${this.farm.resources.eggs} cartons of eggs, ${this.farm.resources.milk} gallons of milk, ${this.farm.resources.poems} poems, ${this.farm.materials.wood} bundles of wood, ${this.farm.materials.brick} bricks, ${this.farm.materials.iron} ingots of iron`
      );
    } else {
      this.respond(
        username,
        "Sorry, only the farmer can check inventory.",
        true
      );
    }
  }

  processLivestock(target, username) {
    if (username === this.farm.farmer.username) {
      const animalCounts = {
        pig: 0,
        sheep: 0,
        chicken: 0,
        cow: 0,
        goat: 0
      };
      this.farm.animals.forEach(animal => animalCounts[animal.type]++);
      this.respond(
        target,
        `${this.farm.name} has: ${animalCounts.pig} pig(s), ${animalCounts.sheep} sheep(s), ${animalCounts.chicken} chicken(s), ${animalCounts.cow} cow(s), ${animalCounts.goat} goat(s)`
      );
    } else {
      this.respond(
        username,
        "Sorry, only the farmer can check on the livestock.",
        true
      );
    }
  }

  async processNameFarm(newName, target, username) {
    if (username === this.farm.farmer.username) {
      if (newName.length > 0) {
        this.respond(
          target,
          `Per ${this.farm.farmer.title} ${username}'s request, ${this.farm.name} will now be called ${newName}`
        );
        this.farm.name = newName;
        await this.farm.save();
      } else {
        this.respond(username, `Invalid farm name: ${newName}`, true);
      }
    } else {
      this.respond(
        username,
        "Sorry, only the farmer can change the farm's name.",
        true
      );
    }
  }

  async processNewAnimal(type, target, username) {
    if (username !== this.farm.farmer.username) {
      let animal = this.farm.animals.find(
        animal => animal.username === username
      );
      if (!!animal) {
        this.respond(
          username,
          `You are a ${animal.type}. You can't just all of a sudden become an adolescent ${type}.`,
          true
        );
      } else {
        animal = new Animal({ username, type });
        await animal.save();
        this.farm.animals.push(animal);
        await this.farm.save();
        this.respond(
          target,
          `Woa, there! An adolescent ${type} is born. Name on the tag says ${username}. Welcome to ${this.farm.name}, little one.`
        );
      }
    } else {
      this.respond(
        username,
        "Sorry, the farmer can't become an animal. That would be crazy.",
        true
      );
    }
  }

  async processEvolve(target, username) {
    if (username !== this.farm.farmer.username) {
      let animal = this.farm.animals.find(
        animal => animal.username === username
      );
      if (!!animal && animal.level < 4 && animal.exp > 20) {
        animal.exp = 0;
        animal.level += 1;
        await animal.save();
        this.respond(
          target,
          `${username} has evolved from a(n) ${
            animalLevelMap[animal.level - 1]
          } ${animal.type} into a(n) ${animalLevelMap[animal.level]} ${
            animal.type
          }. Yeeeeeeehaaawwww!!!`
        );
      } else {
        this.respond(
          username,
          "Sorry, you're not quite ready to evolve.",
          true
        );
      }
    } else {
      this.respond(username, "Sorry, only animals can evolve.", true);
    }
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

  async processAnimalNoise(type, username) {
    if (!this.productionMap[type].animalsProduced.includes(username)) {
      const curAnimal = this.farm.animals.find(
        animal => animal.type === type && animal.username === username
      );
      if (!!curAnimal) {
        this.productionMap[type].animalsProduced.push(username);
        this.productionMap[type].units += this.calcUnitsProduced(curAnimal);
        animal.exp += 1;
        if (animal.exp > 20 && animal.level < 4) {
          setTimeout(() => {
            this.respond(
              username,
              `Hmm, it looks like you've grown. Type !evolve to level up.`,
              true
            );
          }, 1000 * 10);
        }
        await animal.save();
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
