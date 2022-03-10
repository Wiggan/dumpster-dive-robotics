'use strict';

class ChargeTrigger extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.block = new Block(this, [0, 0, 0]);
        this.sensor1 = new Drawable(this, [-0.4, 0, 0.1], models.box);
        this.sensor2 = new Drawable(this, [-0.4, 0, 0.2], models.box);
        this.sensor1.local_transform.scale(0.3, 0.9, 0.05);
        this.sensor2.local_transform.scale(0.3, 0.9, 0.05);
        this.sensor1.material = materials.metall;
        this.sensor2.material = materials.metall;
        this.triggees = [];
        this.triggered = false;
    }

    init(scene) {
        this.boss = scene.getBoss();
    }

    toJSON(key) {
        return {
            class: 'ChargeTrigger',
            uuid: this.uuid,
            local_position: this.local_position,
            triggees: this.triggees
        }
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        var within_range = false;
        if (this.boss) {
            if (vec3.dist(this.boss.getWorldPosition(), this.getWorldPosition()) < 1.2) {
                within_range = true;
            } 
        }
        if (within_range && !this.triggered) {
            this.triggered = true;
            this.triggees.forEach((triggee) => {
                var t = game.scene.entity_uuid_map.get(triggee);
                if (t) {
                    t.start_triggering();
                }
            });
        } else if (!within_range && this.triggered) {
            this.triggered = false;
            this.triggees.forEach((triggee) => {
                var t = game.scene.entity_uuid_map.get(triggee);
                if (t) {
                    t.stop_triggering();
                }
            });
        }
    }
}


classes.ChargeTrigger = ChargeTrigger;