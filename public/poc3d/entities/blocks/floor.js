'use strict';

class Floor extends Drawable {
    constructor(parent, local_position) {
        super(parent, local_position, models.box);
        this.local_position = local_position;
        this.material = materials.dirt;
        this.local_transform.yaw(Math.floor(Math.random()*4)*90);
        if (Math.random() < 0.5) {
            this.local_transform.roll(180);
        }
    }
    
    toJSON(key) {
        return {
            class: 'Floor',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}

classes.Floor = Floor;