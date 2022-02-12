'use strict';


class Lantern extends Drawable {
    constructor(parent, local_position) {
        super(null, local_position, models.box);
        this.local_position = local_position;
        this.light = new FloatingLightBulb(this, [0,1,0], parent);
        this.colliders.push(new Collider(this, [0, 0, 0], CollisionTypes.Level, 0.2, 0.2));
        this.material = materials.dirt;
    }
    
    toJSON(key) {
        return {
            class: 'Lantern',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}

classes.Lantern = Lantern;