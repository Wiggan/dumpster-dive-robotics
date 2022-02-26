'use strict'

class VacuumFan extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.position = position;
        this.type = PickableType.Enemy;
        this.base = new Drawable(this, [0, 0, 0.45], models.vacuum_fan.base);
        this.wheels = new Drawable(this, [-0.2, 0, 0.45], models.vacuum_fan.wheels);
        this.third_wheel = new Drawable(this, [0.2, 0, 0.45], models.vacuum_fan.third_wheel);
        this.fan = new Drawable(this, [0.1, 0, 0.45], models.vacuum_fan.fan);
        this.lamp = new Drawable(this, [-0.095, 0, 0.23], models.box);
        this.lamp.local_transform.scale([0.02, 0.16, 0.015]);
        this.lamp.material = materials.red_led;
        this.base.material = materials.metall;
        this.fan.material = materials.metall;
        this.wheels.material = materials.rubber;
        this.third_wheel.material = materials.rubber;
        this.collider = new Collider(this, [0, 0, 0.25], CollisionLayer.Enemy, 0.4, 0.4);
        this.stats = {
            movement_speed: 0.0005,
            dmg: 1,
            patrol_tolerance: 0.3
        };
        this.strategy = new PatrolStrategy(this);
    }
    
    toJSON(key) {
        return {
            class: 'VacuumFan',
            strategy: this.strategy,
            local_position: this.position,
        }
    }

    update(elapsed, dirty) {
        dirty |= this.strategy.update(elapsed);
        this.fan.local_transform.roll(0.8*elapsed);
        this.lamp.local_transform.roll(1.5*elapsed);
        
        
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


classes.VacuumFan = VacuumFan;