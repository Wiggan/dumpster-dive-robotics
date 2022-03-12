'use strict'

class DroneLamp extends Drone {
    constructor(parent, position) {
        super(parent, position);
        this.lamp = new PointLight(this, [0, 0, 0], parent);
        this.lamp.constant = LanternLight.Constant;
        this.lamp.linear = LanternLight.Linear;
        this.lamp.quadratic = LanternLight.Quadratic;
        this.lamp.active = true;
        
        this.lamp.drawable = new Drawable(this, [0, 0, 0], models.lamp_boss.head_lamp);
        this.lamp.drawable.material = materials.light;
    }
    
    toJSON(key) {
        return {
            class: 'DroneLamp',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    onDeath() {
        this.lamp.inactivate();
        super.onDeath();
    }

}


classes.DroneLamp = DroneLamp;