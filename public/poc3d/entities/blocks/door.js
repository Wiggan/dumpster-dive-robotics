'use strict';

class Door extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Background(this, [0, 0, 0]);
        this.background2 = new Background(this, [0, 0, -1]);
        this.door = new Drawable(this, [0, -0.1, -0.5], models.door);
        this.door.collider = new Collider(this.door, [0, 0, 0], CollisionLayer.Level, 0.5, 2);
        this.door.collider2 = new Collider(this.door, [0, 0, 1.1], CollisionLayer.Level, 0.45, 0.1);
        this.door.position =  [0, -0.1, -0.5];
        this.door.local_position =  [0, -0.1, -0.5];
        this.stats = {
            dmg: 1000
        }
        //this.door.local_transform.scale([0.5, 2, 2]);
    }

    stop_triggering() {
        //console.log("Closing door");
        this.door.collider2.local_transform.setPosition([0, 0, 1.1]);
        this.transition = new Transition(this.door, [{
            time: 1000, to: {
                position: this.door.local_position
            }, callback: () => game.scene.entities.push(new Smoke(null, this.door.collider2.getWorldPosition(), [0, 0, 1]))
        }]);
    }
    
    start_triggering() {
        //console.log("Opening door");
        this.door.collider2.local_transform.setPosition([0, 0, 0]);
        this.transition = new Transition(this.door, [{
            time: 1000, to: {
                position: [this.door.local_position[0], this.door.local_position[1], this.door.local_position[2]-2]
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
            this.door.local_transform.setPosition(this.door.position);
            dirty = true;
            this.door.update(0, true);
            this.door.collider2.detectCollisions().forEach(other => {
                if (other.type == CollisionLayer.Player) {
                    other.parent.takeDamage(this.stats.dmg, this, this.door.collider2);
                }
            });
        }
        super.update(elapsed, dirty);
    }
}


classes.Door = Door;