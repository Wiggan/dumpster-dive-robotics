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

    onCollision(other) {
        if (other.collider.type == CollisionLayer.Player) {
            if (this.triggee && typeof this.triggee == 'string' && !this.triggered) {
                var triggee_entity = game.scene.entity_uuid_map.get(this.triggee);
                this.triggered = true;
                triggee_entity.trigger();
                this.onTrigger();
            } else if (/*this.triggee && typeof this.triggee == 'function' &&*/ !this.triggered) {
                this.triggered = true;
                this.onTrigger();
            }
        }
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
    }
}