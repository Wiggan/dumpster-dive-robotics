'use strict';

const timeouts = [100, 50, 100, 50, 100, 50, 1000];

class FlimmeringLight extends Light {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.timeout_index = 0;
        this.light.local_transform.setPosition([0, 1, 0]);
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