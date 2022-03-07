'use strict'

class Trigger extends Entity {
    constructor(parent, local_position, oneoff, width, height) {
        super(parent, local_position)
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Trigger, width || 0.1, height || 0.1);
        this.triggered = false;
        this.oneoff = oneoff;
        this.triggee = '';
    }

    onTrigger() {
        console.log("huh");
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        var triggered = false;
        var triggerer;
        this.collider.detectCollisions().forEach(other => {
            if (other.type == CollisionLayer.Player || other.type == CollisionLayer.Enemy) {
                triggered = true;
                triggerer = other;
            } 
        });
        if (triggered && !this.triggered) {
            this.triggered = true;
            if (this.triggees) {
                this.triggees.forEach((triggee) => {
                    var t = game.scene.entity_uuid_map.get(triggee);
                    if (t) {
                        t.start_triggering();
                    }
                });
            }
            this.onTrigger(triggerer);
        } else if (!triggered && this.triggered) {
            this.triggered = false;
            if (this.triggees) {
                this.triggees.forEach((triggee) => {
                    var t = game.scene.entity_uuid_map.get(triggee);
                    if (t) {
                        t.stop_triggering();
                    }
                });
            }
        }
    }
}