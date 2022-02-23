'use strict';

const timeouts = [100, 50, 100, 50, 100, 50, 1000];

class FlimmeringLight extends Drawable {
    constructor(parent, local_position) {
        super(parent, local_position, models.box);
        this.light = new PointLight(this, [0, 0, 0], parent);
        this.local_position = local_position;
        this.light.ambient = [0.0, 0.0, 0.0];
        this.light.diffuse = [0.7, 0.7, 0.6];
        this.light.specular = [0.8, 0.8, 0.8];
        this.light.constant = 1.0;
        this.light.linear = 1.1;
        this.light.quadratic = 0.65;
        this.local_transform.scaleUniform(0.3);
        this.material = materials.light;
        this.timeout_index = 0;
        this.toggle();
    }
    
    toggle() {
        window.setTimeout(() => {
            this.timeout_index++;
            this.light.active = !this.light.active;
            this.toggle();
        }, timeouts[this.timeout_index%timeouts.length]);
    }

    toJSON(key) {
        return {
            class: 'FlimmeringLight',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }

    update(elapsed, dirty) {

        if (this.light.active) {
            this.material = materials.light;
        } else {
            this.material = materials.light_inactive;
        }
        super.update(elapsed, dirty);
    }
}

classes.FlimmeringLight = FlimmeringLight;