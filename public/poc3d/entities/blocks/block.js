'use strict';

class Block extends Drawable {
    constructor(parent, local_position) {
        super(parent, [local_position[0], 0, local_position[2]], models.background);
        this.local_position = local_position;
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Level, 1, 1);
        this.material = materials.dirt;
        this.local_transform.yaw(Math.floor(Math.random()*4)*90);
        if (Math.random() < 0.5) {
            this.local_transform.roll(180);
        }
        this.local_transform.scale([1, 2, 1]);
    }

    
    toJSON(key) {
        return {
            class: 'Block',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}


classes.Block = Block;