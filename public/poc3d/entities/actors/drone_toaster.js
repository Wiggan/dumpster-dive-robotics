'use strict'

class DroneToaster extends Drone {
    constructor(parent, position) {
        super(parent, position);
        this.toaster = new Toaster(this, [-0.1, 0, 0.1], models.vacuum_fan.toaster);
        this.toaster.material = materials.metall;
        this.blinking_drawables_on_damage.push(this.toaster)
    }
    
    toJSON(key) {
        return {
            class: 'DroneToaster',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }
}


classes.DroneToaster = DroneToaster;