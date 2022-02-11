'use strict'

class Loot extends Pickable {
    constructor(position, item) {
        super(null, [position[0] + Math.random() - 0.5, position[1], position[2] + Math.random() - 0.5]);
        this.drawable = new Drawable(this, [0, 0, 0], models.box);
        this.drawable.material = materials.red_led;
        this.drawable.id = this.id;
        this.item = item;
        this.label = item.name;
        game.scene.entities.push(this);
    }

    interact() {
        player.inventory.push(this.item);
        game.scene.entities.splice(game.scene.entities.lastIndexOf(this), 1);
    }
}