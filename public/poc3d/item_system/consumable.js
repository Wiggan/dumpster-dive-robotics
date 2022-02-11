
class Consumable {
    constructor({x, y, name, description, effect, amount}) {
        this.position = {x, y};
        this.name = name;
        this.description = description;
        this.effect = effect;
        this.amount = amount;
    }
}

const hp_effect = (consumer) => {consumer.repair(amount);};
const hp_small = (x, y) => (new Consumable({x: x, y: y, name: "Small Repair Kit", description: "Repairs 10 points", amount: 10, effect: hp_effect}));
const hp_medium = (x, y) => (new Consumable({x: x, y: y, name: "Medium Repair Kit", description: "Repairs 30 points", amount: 30, effect: hp_effect}));
const hp_large = (x, y) => (new Consumable({x: x, y: y, name: "Large Repair Kit", description: "Repairs 90 points", amount: 90, effect: hp_effect}));

const mana_effect = (consumer) => {consumer.charge(amount);};
const mana_small = (x, y) => (new Consumable({x: x, y: y, name: "Small battery", description: "Charges 10 points", amount: 10, effect: mana_effect}));
const mana_medium = (x, y) => (new Consumable({x: x, y: y, name: "Medium battery", description: "Charges 30 points", amount: 30, effect: mana_effect}));
const mana_large = (x, y) => (new Consumable({x: x, y: y, name: "Large battery", description: "Charges 90 points", amount: 90, effect: mana_effect}));

