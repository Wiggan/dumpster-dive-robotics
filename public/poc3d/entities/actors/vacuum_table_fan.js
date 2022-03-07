'use strict'

class VacuumTableFan extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.local_position = position;
        this.type = PickableType.Enemy;
        this.base = new Drawable(this, [0, 0, 0.45], models.vacuum_fan.base);
        this.wheels = new Drawable(this, [-0.2, 0, 0.45], models.vacuum_fan.wheels);
        this.third_wheel = new Drawable(this, [0.2, 0, 0.45], models.vacuum_fan.third_wheel);
        this.fan_base = new Drawable(this, [0, 0, 0.45], models.vacuum_fan.table_fan_base);
        this.fan_blade = new Drawable(this, [0.157, 0, -0.0211], models.vacuum_fan.table_fan_blade);
        this.lamp = new Drawable(this, [-0.095, 0, 0.23], models.box);
        this.lamp.local_transform.scale([0.02, 0.16, 0.015]);
        this.lamp.material = materials.red_led;
        this.base.material = materials.metall;
        this.fan_base.material = materials.metall;
        this.fan_blade.material = materials.metall;
        this.wheels.material = materials.rubber;
        this.third_wheel.material = materials.rubber;
        this.collider = new Collider(this, [0, 0, 0.05], CollisionLayer.Enemy, 0.3, 0.7);
        this.pusher = new Collider(this, [1, 0, 0], CollisionLayer.Trigger, 2, 0.4);
        this.stats = {
            movement_speed: 0.0005,
            dmg: 1,
            patrol_tolerance: 0.3,
            push: 0.00007,
            dmg_cooldown: 3000,
        };
        this.strategy = new PatrolStrategy(this);
        this.blinking_drawables_on_damage = [this.base, this.fan_base, this.fan_blade];

    }
    
    toJSON(key) {
        return {
            class: 'VacuumTableFan',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    update(elapsed, dirty) {
        dirty |= this.strategy.update(elapsed);
        this.fan_blade.local_transform.pitch(0.8*elapsed);
        this.lamp.local_transform.roll(1.5*elapsed);
        
        this.pusher.detectCollisions().forEach((other) => {
            if (other.parent == player) {
                if (this.getWorldPosition()[0] < player.getWorldPosition()[0]) {
                    player.force[0] += this.stats.push;
                } else {
                    player.force[0] -= this.stats.push;
                }
            }
        });
        
        if (this.look_at) {
            var target_vector = vec3.create();
            vec3.sub(target_vector, this.look_at, position(this.getWorldTransform()));
            var forward_vector = down(this.getWorldTransform());
            target_vector[1] = 0;
            forward_vector[1] = 0;
            var angle = rad2deg(vec3.angle(target_vector, forward_vector));

            if (Math.abs(angle) > 0.005) {
                var angle_increment = Math.sign(angle) * Math.min(Math.abs(angle), this.rotation_speed * elapsed);
                this.local_transform.roll(angle_increment);
                dirty = true;
            }
        }

        super.update(elapsed, dirty);
        
    }
}


classes.VacuumTableFan = VacuumTableFan;