'use strict';

class SinkableWall extends Drawable {
    constructor(parent, local_position) {
        super(parent, [local_position[0], 3, local_position[2]], models.box);
        this.local_position = local_position;
        this.material = materials.dirt;
        this.colliders.push(new Collider(this, [0, 0, 0], CollisionTypes.Level, 2, 2));
        this.local_transform.yaw(Math.floor(Math.random()*6)*60);
        this.position = [local_position[0], 3, local_position[2]];
    }

    trigger() {
        this.transition = new Transition(this, [{
            time: 50000, to: {
                position: [this.local_position[0], 0, this.local_position[2]],
                collider: {type: CollisionTypes.NoCollision}}
        }]);
    }
    
    toJSON(key) {
        return {
            class: 'SinkableWall',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
    
    update(elapsed, dirty) {
        if (this.transition) {
            this.transition.update(elapsed);
            this.local_transform.setPosition(this.position);
            dirty = true;
        }
        super.update(elapsed, dirty);
    }
}


classes.SinkableWall = SinkableWall;