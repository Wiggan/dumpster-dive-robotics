'use strict';

class LightSensor extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Background(this, [0, -2 + Math.random()*0.3, 0], models.box);
        this.sensor = new Drawable(this, [0, 0, 0], models.box);
        this.sensor.local_transform.scale([0.4, 0.4, 0.4]);
        this.sensor.material = materials.metall;
        this.range = 4;
        this.triggee = '';
        this.triggered = false;
    }

    toJSON(key) {
        return {
            class: 'LightSensor',
            uuid: this.uuid,
            local_position: this.local_position,
            triggee: this.triggee
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
            game.scene.entity_uuid_map.get(this.triggee).start_triggering();
        } else if (!within_range && this.triggered) {
            this.triggered = false;
            game.scene.entity_uuid_map.get(this.triggee).stop_triggering();
        }
    }
}


classes.LightSensor = LightSensor;