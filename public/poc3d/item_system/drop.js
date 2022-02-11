

function drop(dropper) {
    const skill_drop_chance = 0.01;
    const item_drop_chance = 0.1;
    const consumable_drop_chance = 0.5;
    const cash_drop_chance = 0.5;
    const drop_count = Math.round(Math.random()*dropper.max_drop);
    for (var i = 0; i < drop_count; i++) {
        if (Math.random() < skill_drop_chance) {
            //new Loot(dropper.getWorldPosition(), drop_skill(dropper));
        } else if (Math.random() < item_drop_chance) {
            //new Loot(dropper.getWorldPosition(), drop_item(dropper));
        } else if (Math.random() < consumable_drop_chance) {
            new Loot(dropper.getWorldPosition(), drop_consumable(dropper));
        } else if (Math.random() < cash_drop_chance) {
            //new Loot(dropper.getWorldPosition(), drop_cash(dropper));
        }
    }   
}

/**
 * Needs to return max level of the dropper, but also avoid dropping level 1 consumables when level 80...
 *  
 */
function get_item_drop_level(dropper) {
    const min_level = Math.max(1, dropper.level - 40);  // So never drop 40 level stuff below own level?
    const max_level = dropper.level;
    return min_level + Math.round(Math.random() * (max_level - min_level));
}

function drop_skill(dropper) {
    console.log("Drop skill");
}

function drop_item(dropper) {
    console.log("Drop item of level: " + get_item_drop_level(dropper));
}

function drop_hp(dropper) {
    var hp;
    if (dropper.level < 10) {
        hp = hp_small(dropper.x, dropper.y);
    } else if (dropper.level < 20) {
        hp = hp_medium(dropper.x, dropper.y);
    } else {
        hp = hp_large(dropper.x, dropper.y);
    }
    console.log(hp.description);
    console.log(JSON.stringify(hp));
    return hp;
}

function drop_mana(dropper) {
    var mana;
    if (dropper.level < 10) {
        mana = mana_small();
    } else if (dropper.level < 20) {
        mana = mana_medium();
    } else {
        mana = mana_large();
    }
    console.log(mana.description);
    console.log(JSON.stringify(mana));
    return mana;
}

function drop_consumable(dropper) {
    console.log("Drop consumable");
    const mana_drop_chance = 0.4;
    const solder_suck_wire_drop_chance = 0.1;
    if (Math.random() < mana_drop_chance) {
        return drop_mana(dropper);
    } else if (Math.random() < solder_suck_wire_drop_chance) {
        return {}; //drop_solder_suck_wire(dropper);
    } else {
        return drop_hp(dropper);
    }
}

function drop_cash(dropper) {
    console.log("Drop cash");
}