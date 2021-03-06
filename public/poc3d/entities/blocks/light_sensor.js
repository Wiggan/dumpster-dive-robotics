'use strict';

class LightSensor extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.block = new Block(this, [0, 0, 0], models.box);
        this.sensor = new Drawable(this, [0, 0, 0.5], models.light_sensor);
        this.sensor.material = materials.metall;
        this.range = 4;
        this.triggees = [];
        this.triggered = false;
    }

    toJSON(key) {
        return {
            class: 'LightSensor',
            uuid: this.uuid,
            local_position: this.local_position,
            triggees: this.triggees,
            range: this.range
        }
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        var within_range = false;
        game.scene.lights.forEach(light => {
            if (light.active && vec3.dist(this.getWorldPosition(), light.getWorldPosition()) < this.range) {
                within_range = true;
            } 
        })
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


classes.LightSensor = LightSensor;