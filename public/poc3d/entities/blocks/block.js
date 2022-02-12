'use strict';

class Block extends Drawable {
    constructor(parent, local_position) {
        super(parent, [local_position[0], 0, local_position[2]], models.box);
        this.local_position = local_position;
        this.colliders.push(new Collider(this, [0, 0, 0], CollisionTypes.Level, 2, 2));
        this.material = materials.dirt;
        this.local_transform.yaw(Math.floor(Math.random()*4)*90);
        if (Math.random() < 0.5) {
            this.local_transform.roll(180);
        }
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