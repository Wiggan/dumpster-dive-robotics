'use strict'

class VacuumFan extends VacuumBase {
    constructor(parent, position) {
        super(position);
        this.fan = new Drawable(this, [0.1, 0, 0.45], models.vacuum_fan.fan);
        this.fan.material = materials.metall;
        this.collider = new Collider(this, [0, 0, 0.3], CollisionLayer.Enemy, 0.3, 0.3);
        this.blinking_drawables_on_damage.push(this.fan);
        this.update(0, true);
    }
    
    toJSON(key) {
        return {
            class: 'VacuumFan',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    update(elapsed, dirty) {
        this.fan.local_transform.roll(0.8*elapsed);
        super.update(elapsed, dirty);
    }
}


classes.VacuumFan = VacuumFan;