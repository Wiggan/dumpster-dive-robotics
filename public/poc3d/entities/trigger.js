'use strict'

class Trigger extends Entity {
    constructor(parent, local_position, oneoff) {
        super(parent, local_position)
        this.colliders.push(new Collider(this, [0, 0, 0], CollisionTypes.Trigger, 0.1, 0.1));
        this.triggered = false;
        this.oneoff = oneoff;
        this.triggee = '';
    }

    onTrigger() {}

    onCollision(other) {
        if (other.collider.type == CollisionTypes.Player) {
            if (this.triggee && !this.triggered) {
                var triggee_entity = game.scene.entity_uuid_map.get(this.triggee);
                console.log("Triggered!");
                this.triggered = true;
                triggee_entity.trigger();
                this.onTrigger();
            }
        }
    }
}