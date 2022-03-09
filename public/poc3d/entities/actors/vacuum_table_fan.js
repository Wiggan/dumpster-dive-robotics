'use strict'

class VacuumTableFan extends VacuumBase {
    constructor(parent, position) {
        super(position);
        this.fan_base = new Drawable(this, [0, 0, 0.45], models.vacuum_fan.table_fan_base);
        this.fan_blade = new Drawable(this, [0.177, 0, -0.0211], models.vacuum_fan.table_fan_blade);
        this.fan_base.material = materials.metall;
        this.fan_blade.material = materials.metall;
        this.collider = new Collider(this, [0, 0, 0.05], CollisionLayer.Enemy, 0.3, 0.7);
        this.pusher = new Collider(this, [1, 0, 0], CollisionLayer.Trigger, 2, 0.4);
        this.stats.push = 0.00007;
        this.blinking_drawables_on_damage.push(this.fan_base);
        this.blinking_drawables_on_damage.push(this.fan_blade);
        this.fan_blade.dust = new DustContinuous(this.fan_blade, [0.2, 0.2, 0], [1, 0, 0], 15, 0.1);
    }
    
    toJSON(key) {
        return {
            class: 'VacuumTableFan',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    update(elapsed, dirty) {
        this.fan_blade.local_transform.pitch(0.8*elapsed);
        
        this.pusher.detectCollisions().forEach((other) => {
            if (other.parent == player) {
                if (this.getWorldPosition()[0] < player.getWorldPosition()[0]) {
                    player.force[0] += this.stats.push;
                } else {
                    player.force[0] -= this.stats.push;
                }
            }
        });
        
        super.update(elapsed, dirty);
        
    }
}


classes.VacuumTableFan = VacuumTableFan;