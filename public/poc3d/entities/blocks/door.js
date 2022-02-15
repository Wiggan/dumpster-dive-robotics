'use strict';

class Door extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.background = new Background(this, [0, -2 + Math.random()*0.3, 0], models.box);
        this.door = new Drawable(this, [0, 0, 0], models.box);
        this.local_position =  [0, 0, 0];
        this.material = materials.dirt;
        this.door.collider = new Collider(this.door, [0, 0, 0], CollisionLayer.Level, 0.5, 1);
        this.door.position =  [0, 0, 0];
        this.door.local_transform.scale([0.5, 2, 1]);
    }

    stop_triggering() {
        console.log("Closing door");
        this.transition = new Transition(this.door, [{
            time: 1000, to: {
                position: [this.local_position[0], this.local_position[1], this.local_position[2]]
            }
        }]);
    }
    
    start_triggering() {
        console.log("Opening door");
        this.transition = new Transition(this.door, [{
            time: 1000, to: {
                position: [this.local_position[0], this.local_position[1], this.local_position[2]-1]
            }
        }]);
    }
    
    toJSON(key) {
        return {
            class: 'Door',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
    
    update(elapsed, dirty) {
        if (this.transition) {
            this.transition.update(elapsed);
            this.door.local_transform.setPosition(this.door.position);
            dirty = true;
        }
        super.update(elapsed, dirty);
    }
}


classes.Door = Door;