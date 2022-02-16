'use strict';

class Background extends Drawable {
    constructor(parent, local_position) {
        super(parent, [local_position[0], -1.4 + Math.random()*0.1, local_position[2]], models.background);
        this.local_position = local_position;
        this.material = materials.dirt;
        this.local_transform.yaw(Math.floor(Math.random()*4)*90);
        this.local_transform.roll(Math.floor(Math.random()*4)*90);
        this.local_transform.pitch(Math.floor(Math.random()*4)*90);
        this.local_transform.scale([1, 1, 1]);
    }

    toJSON(key) {
        return {
            class: 'Background',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}


classes.Background = Background;