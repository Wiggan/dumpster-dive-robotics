'use strict';

class WaterSurface extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Background(this, [0, -2 + Math.random()*0.3, 0], models.box);
        this.surface = new Drawable(this, [0, 0, -0.45], models.box);
        this.surface.local_transform.scale([1.0, 1.0, 0.01]);
        this.surface.material = materials.water;
        /* 
        for(var x = 0; x < 10; x++) {
            for(var y = 0; y < 10; y++) {
                
            }
        } */
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