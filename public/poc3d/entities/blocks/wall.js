'use strict';

class Wall extends Drawable {
    constructor(parent, local_position) {
        super(parent, [local_position[0], 3, local_position[2]], models.box);
        this.local_position = local_position;
        this.material = materials.dirt;
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Level, 1, 1);
        this.local_transform.yaw(Math.floor(Math.random()*4)*90);
        if (Math.random() < 0.5) {
            this.local_transform.roll(180);
        }
    }

    
    toJSON(key) {
        return {
            class: 'Wall',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}


classes.Wall = Wall;