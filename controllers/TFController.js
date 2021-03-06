const Farm = require("../models/Farm");
const Animal = require("../models/Animal");

const animalTypes = ["pig", "sheep", "chicken", "cow", "goat"];
const farmerTitles = [
  "Farmer",
  "Mister Farmer",
  "Farmer Captain",
  "Mega Farmer Boss",
  "Omniscient Farm Commander",
  "Undying Farm Deity"
];
const tractorLevelMap = {
  0: "No Tractor",
  1: "Rusty Tractor",
  2: "Shiny Red Tractor",
  3: "Tesla Cyber Tractor"
};
const overallLevelMap = {
  0: "No Overalls",
  1: "Patchy Overalls",
  2: "Fine Denim Overalls",
  3: "Silken Balenciaga Overalls"
};
const dogLevelMap = {
  0: "No Dog",
  1: "Scrappy Mutt",
  2: "Loyal Guard Dog",
  3: "Hank The Cowdog"
};
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
accomodationRecipeMap = {
  pig: {
    wood: 25,
    iron: 15
  },
  sheep: {
    wood: 35,
    brick: 5
  },
  chicken: {
    iron: 40
  },
  cow: {
    brick: 30,
    iron: 10
  },
  goat: {
    brick: 35,
    wood: 5
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
    this.market = null;
    this.spinMarket();
    setInterval(this.spinMarket.bind(this), 1000 * 60 * 90);
  }

  async loadFarm(farmId) {
    this.farm = await Farm.findById(farmId).populate("farmer animals");
  }

  runCommand(command) {
    const { target, args, username } = command;
    if (this.farm.dingles === -1 && args[0] === "!buildfarm") {
      this.processBuildFarm(target, username);
    } else {
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
        case "!market":
          this.processMarket(target, username);
          break;
        case "!blackmarket":
          this.processBlackMarket(target, username);
          break;
        case "!buy":
          this.processBuy(args.slice(1, 3), target, username);
          break;
        case "!sell":
          this.processSell(args.slice(1, 3), target, username);
          break;
        case "!build":
          this.processBuild(args[1], target, username);
          break;
        case "!buildings":
          this.processBuildings(target, username);
          break;
        case "!evolve":
          this.processEvolve(target, username);
          break;
        case "!birth":
          this.processNewAnimal(args[1], target, username);
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
  }

  processHelp(username) {
    if (username === this.farm.farmer.username) {
      this.respond(
        target,
        `Howdy, ${this.farm.farmer.title} ${username}! In order to interact with your Twitch Farm, you can use the following commands: '!namefarm [name]' will rename your farm. '!makerounds' will work the farm for an hour; if your animals are awake they'll produce resources during this time. '!inventory' will display what ya got to work with. !livestock will display how many of each animal you own. '!market' will display current prices for stuff. '!blackmarket' will do the same.. but for other stuff. '!buy [quantity] [market thing]' and '!buy [blackmarket thing]' is how you buy stuff. '!sell [resource]' is how you sell your farm's produce. '!buildings' will display the level of your farm's accomodations. '!build [animal type]' is how you upgrade those accomodations. Easy as pie!`
      );
    } else {
      this.respond(
        target,
        `Even if you aren't the farmer, you have a vital role to play around these parts. You can join the farm by typing '!birth [animal]', where [animal] is either pig, sheep, chicken, cow, or goat. Good luck to ya!`
      );
    }
  }

  async processBuildFarm(target, username) {
    if (username === this.farm.farmer.username) {
      this.farm.dingles = 5;
      await this.farm.save();
      this.respond(
        target,
        `Yeehaw! Here's the deed to your new land and the keys to your farm. Whoever made this bot never wrote a tutorial, so you're just gonna have to dive in raw-dog and hope for the best! If you get stuck, typing '!help' is probably a good place to start. In the mean time, here's a few dingles to get you goin. Good luck, ${this.farm.farmer.title} ${username}.`
      );
    } else {
      this.respond(
        username,
        "Sorry, only the channel owner can build a farm here.",
        true
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

  processMarket(target, username) {
    if (username === this.farm.farmer.username) {
      let marketPrices = [];
      Object.keys(this.market).forEach(key =>
        marketPrices.push(`${key} (${this.market[key]} dingles)`)
      );
      this.respond(target, "Current market prices: " + marketPrices.join(", "));
    } else {
      this.respond(
        username,
        "Sorry, only the farmer can check on the market.",
        true
      );
    }
  }

  processBlackMarket(target, username) {
    if (username === this.farm.farmer.username) {
      const { accessories } = this.farm.farmer;
      let marketPrices = [];
      let nextTitleInd = farmerTitles.indexOf(this.farm.farmer.title) + 1;
      if (nextTitleInd < farmerTitles.length) {
        marketPrices.push(
          `New Title: ${nextTitleInd * 14} dingles (Currently: ${
            this.farm.farmer.title
          }))`
        );
      }
      if (accessories.tractor < 3) {
        marketPrices.push(
          `New Tractor: ${(accessories.tractor + 1) * 18} dingles (Currently: ${
            tractorLevelMap[accessories.tractor]
          }))`
        );
      }
      if (accessories.overalls < 3) {
        marketPrices.push(
          `New Overalls: ${(accessories.overalls + 1) *
            12} dingles (Currently: ${overallLevelMap[accessories.overalls]}))`
        );
      }
      if (accessories.dog < 3) {
        marketPrices.push(
          `New Dog: ${(accessories.dog + 1) * 16} dingles (Currently: ${
            dogLevelMap[accessories.dog]
          }))`
        );
      }
      this.respond(
        target,
        "You a cop? Here's what I got: " + marketPrices.join(", ")
      );
    } else {
      this.respond(
        username,
        "Sorry, only the farmer can check on the black market.",
        true
      );
    }
  }

  async processBuy(args, target, username) {
    if (username === this.farm.farmer.username) {
      let [quantity, material] = args;
      if (quantity === "title") {
        let nextTitleInd = farmerTitles.indexOf(this.farm.farmer.title) + 1;
        if (
          nextTitleInd < farmerTitles.length &&
          this.farm.dingles >= nextTitleInd * 14
        ) {
          this.farm.dingles -= nextTitleInd * 14;
          this.farm.farmer.title = farmerTitles[nextTitleInd];
          await this.farm.farmer.save();
          await this.farm.save();
          return this.respond(
            target,
            `Success! You'll now be known as ${this.farm.farmer.title} ${username}.`
          );
        }
      } else if (quantity === "tractor") {
        if (
          this.farm.farmer.accessories.tractor < 3 &&
          this.farm.dingles >= (this.farm.farmer.accessories.tractor + 1) * 18
        ) {
          this.farm.dingles -= (this.farm.farmer.accessories.tractor + 1) * 18;
          this.farm.farmer.accessories.tractor += 1;
          await this.farm.farmer.save();
          await this.farm.save();
          this.respond(
            target,
            `Success! You now own: ${
              tractorLevelMap[this.farm.farmer.accessories.tractor]
            }.`
          );
        }
      } else if (quantity === "dog") {
        if (
          this.farm.farmer.accessories.dog < 3 &&
          this.farm.dingles >= (this.farm.farmer.accessories.dog + 1) * 16
        ) {
          this.farm.dingles -= (this.farm.farmer.accessories.dog + 1) * 16;
          this.farm.farmer.accessories.dog += 1;
          await this.farm.farmer.save();
          await this.farm.save();
          this.respond(
            target,
            `Success! You now own: ${
              dogLevelMap[this.farm.farmer.accessories.dog]
            }.`
          );
        }
      } else if (quantity === "overalls") {
        if (
          this.farm.farmer.accessories.overalls < 3 &&
          this.farm.dingles >= (this.farm.farmer.accessories.overalls + 1) * 12
        ) {
          this.farm.dingles -= (this.farm.farmer.accessories.overalls + 1) * 12;
          this.farm.farmer.accessories.overalls += 1;
          await this.farm.farmer.save();
          await this.farm.save();
          this.respond(
            target,
            `Success! You now own: ${
              overallLevelMap[this.farm.farmer.accessories.overalls]
            }.`
          );
        }
      } else {
        quantity = parseInt(quantity);
        let cost = quantity * this.market[material];
        if (quantity < 0) {
          this.respond(target, `Invalid quantity: ${quantity}`);
        } else if (!this.farm.materials.hasOwnProperty(material)) {
          this.respond(target, `Invalid material: ${material}`);
        } else if (this.farm.dingles < cost) {
          this.respond(
            target,
            `Stop right there! That'll cost ${cost} dingles, and you've only got ${this.farm.dingles}.`
          );
        } else {
          this.farm.dingles -= cost;
          this.farm.materials[material] += quantity;
          await this.farm.save();
          this.respond(
            target,
            `Nice doing business, ${this.farm.farmer.title} ${username}. You got ${this.farm.dingles} dingles left.`
          );
        }
      }
    } else {
      this.respond(username, "Sorry, only the farmer can buy stuff.", true);
    }
  }

  async processSell(args, target, username) {
    if (username === this.farm.farmer.username) {
      let [quantity, resource] = args;
      quantity = parseInt(quantity);
      let cost = quantity * this.market[resource];
      if (quantity < 0) {
        this.respond(target, `Invalid quantity: ${quantity}`);
      } else if (!this.farm.resources.hasOwnProperty(resource)) {
        this.respond(target, `Invalid resource: ${resource}`);
      } else if (quantity > this.farm.resources[resource]) {
        this.respond(
          target,
          `Stop right there! You've only got ${this.farm.resources[resource]} for sellin'.`
        );
      } else {
        this.farm.dingles += cost;
        this.farm.resources[resource] -= quantity;
        await this.farm.save();
        this.respond(
          target,
          `It's a deal, ${this.farm.farmer.title} ${username}. You sold ${quantity} units of ${resource} for ${cost} dingles.`
        );
      }
    } else {
      this.respond(username, "Sorry, only the farmer can sell stuff.", true);
    }
  }

  async processBuild(type, target, username) {
    if (username === this.farm.farmer.username) {
      let recipe = accomodationRecipeMap[type];
      let nextLevel = this.farm.accomodations[type] + 1;
      let hasEnoughMaterials = Object.keys(recipe).reduce(
        (prev, cur) =>
          prev && recipe[cur] * nextLevel <= this.farm.materials[cur],
        true
      );

      if (!hasEnoughMaterials) {
        this.respond(target, `You ain't got enough materials.`);
      } else if (nextLevel > 4) {
        this.respond(target, `Your ${type} accomodations are maxed out!`);
      } else if (!animalTypes.includes(type)) {
        this.respond(target, `Invalid accomodation type: ${type}`);
      } else {
        this.farm.accomodations[type] = nextLevel;
        Object.keys(recipe).forEach(
          key => (this.farm.materials[key] -= recipe[key] * nextLevel)
        );
        await this.farm.save();
        this.respond(
          target,
          `Wait 'til the ${type}s see this, ${this.farm.farmer.title} ${username}! Thier accomodations have been upgraded to level ${nextLevel}.`
        );
      }
    } else {
      this.respond(
        username,
        "Sorry, only the farmer can build accomodations around the farm.",
        true
      );
    }
  }

  processBuildings(target, username) {
    if (username === this.farm.farmer.username) {
      let accomodations = [];
      animalTypes.forEach(key => {
        let recipe = accomodationRecipeMap[key];
        let nextLevel = this.farm.accomodations[key] + 1;
        let upgradeCosts =
          nextLevel > 4
            ? "(MAX LVL)"
            : "(Upgrade for " +
              Object.keys(recipe)
                .map(material => `${nextLevel * recipe[material]} ${material}`)
                .join(", ") +
              ")";

        accomodations.push(
          `${key} - level ${this.farm.accomodations[key]} ${upgradeCosts}`
        );
      });
      this.respond(
        target,
        "Current accomodations: " + accomodations.join(", ")
      );
    } else {
      this.respond(
        username,
        `Sorry, only the farmer can check on the buildings at ${this.farm.name}`,
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
          `You are already a ${animal.type}. You can't be born again.`,
          true
        );
      } else if (!animalTypes.includes(type)) {
        this.respond(username, `Invalid animal: ${type}`, true);
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
          }. Yeehaw!`
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

  spinMarket() {
    this.market = {
      bacon: Math.floor(Math.random() * 3) + 2,
      wool: Math.floor(Math.random() * 3) + 2,
      eggs: Math.floor(Math.random() * 3) + 2,
      milk: Math.floor(Math.random() * 3) + 2,
      poems: Math.floor(Math.random() * 3) + 2,
      wood: Math.floor(Math.random() * 4) + 5,
      brick: Math.floor(Math.random() * 4) + 5,
      iron: Math.floor(Math.random() * 4) + 5
    };
  }
}

module.exports = TFController;
