'use strict';

class FloorButton extends Trigger {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.floor_model = new Drawable(this, [0, 0, 0], models.box);
        this.floor_model.local_transform.yaw(Math.floor(Math.random()*4)*90);
        this.button_position = [0, 0.2, 0];
        this.button_model = new Drawable(this, this.button_position, models.box);
        this.button_model.local_transform.scaleUniform(0.8);
        this.local_position = local_position;
        this.material = materials.dirt;
    }
    
    onTrigger() {
        this.transition = new Transition(this, [{
            time: 200, to: {
                button_position: [this.button_position[0], 0.05, this.button_position[2]]
            }
        }]);
    }

    update(elapsed, dirty) {
        if (this.transition) {
            this.button_model.local_transform.setPosition(this.button_position);
            dirty = true;
        }
        super.update(elapsed, dirty);
    }

    toJSON(key) {
        return {
            class: 'FloorButton',
            uuid: this.uuid,
            local_position: this.local_position,
            triggee: this.triggee ? this.triggee : ''
        }
    }
}

classes.FloorButton = FloorButton;