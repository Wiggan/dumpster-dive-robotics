'use strict';

class WaterSurface extends Trigger {
    constructor(parent, local_position) {
        super(parent, local_position, false, 1, 0.2);
        this.local_position = local_position;
        this.background = new Background(this, [0, 0, 0], models.box);
        this.surface = new Drawable(this, [0, -0.1, 0], models.box);
        this.surface.local_transform.scale([1.0, 2.0, 0.01]);
        this.surface.material = materials.water;
        /* 
        for(var x = 0; x < 10; x++) {
            for(var y = 0; y < 10; y++) {
                
            }
        } */
    }

    onTrigger(triggerer) {
        console.log("Water triggered");
        var pos = triggerer.getWorldPosition();
        new WaterSplash(this, [pos[0], 0, 0]);
        new SFX(this, [0, 0, 0], sfx.splash);
        if (triggerer.parent == player && !player.inventory.includes(items.counter_pressurizer)) {
            player.takeDamage(10000, this, this.collider);
        }
    }

    toJSON(key) {
        return {
            class: 'WaterSurface',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}


classes.WaterSurface = WaterSurface;