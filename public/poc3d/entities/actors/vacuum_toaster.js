'use strict'

class Toaster extends DynamicEntity {
    constructor(parent, position) {
        super(parent, position);
        this.drawable = new Drawable(this, [0,0,0], models.vacuum_fan.toaster);
        this.drawable.material = materials.player;
        this.lamp = new Drawable(this, [0, 0, -0.50], models.box);
        this.lamp.material = materials.yellow_led;
        this.lamp.local_transform.scale([0.015, 0.38, 0.015]);
        this.stats = {
            cooldown: 500
        }
        this.cooldown = this.stats.cooldown;
        this.instigator = parent;
        this.launch_points = [new Entity(this, [0.3, 0.1, -0.5]), new Entity(this, [0.3, -0.1, -0.5])];
        this.launch_points[0].local_transform.yaw(20);
        this.launch_points[1].local_transform.yaw(40);
    }

    fire() {
        if (this.cooldown == 0) {
            this.launch_points.forEach(launch_point => {
                var pos = launch_point.getWorldPosition();
                var f = right(launch_point.getWorldTransform());
    
                var toast = new Rocket(pos, f, 0.01, this.instigator);
                toast.drawable.model = models.box;
                toast.drawable.local_transform.scale([0.2, 0.05, 0.2]);
                toast.force = [0, 0, constants.gravity];
                toast.drawable.material = materials.red_led;
            })

            this.cooldown = this.stats.cooldown;
            this.lamp.material = materials.yellow_led;
            this.sound = new SFX(this, [0,0,0], sfx.launch);
        }
    }

    update(elapsed, dirty) {

        this.cooldown = Math.max(0, this.cooldown - elapsed);
        if (this.cooldown == 0 && this.lamp.material == materials.yellow_led) {
            this.lamp.material = materials.green_led;
            window.setTimeout(() => {
                this.fire();
            }, 500);
        }
        super.update(elapsed, dirty);
    }
}


class VacuumToaster extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.local_position = position;
        this.type = PickableType.Enemy;
        this.base = new Drawable(this, [0, 0, 0.45], models.vacuum_fan.base);
        this.wheels = new Drawable(this, [-0.2, 0, 0.45], models.vacuum_fan.wheels);
        this.third_wheel = new Drawable(this, [0.2, 0, 0.45], models.vacuum_fan.third_wheel);
        this.toaster = new Toaster(this, [0, 0, 0.45], models.vacuum_fan.toaster);
        this.lamp = new Drawable(this, [-0.095, 0, 0.23], models.box);
        this.lamp.local_transform.scale([0.02, 0.16, 0.015]);
        this.lamp.material = materials.red_led;
        this.base.material = materials.metall;
        this.toaster.material = materials.metall;
        this.wheels.material = materials.rubber;
        this.third_wheel.material = materials.rubber;
        this.collider = new Collider(this, [0, 0, 0.05], CollisionLayer.Enemy, 0.3, 0.7);
        this.stats = {
            movement_speed: 0.0005,
            dmg: 1,
            patrol_tolerance: 0.3,
            dmg_cooldown: 2000,
        };
        this.strategy = new PatrolStrategy(this);
        this.blinking_drawables_on_damage = [this.base, this.toaster];

    }
    
    toJSON(key) {
        return {
            class: 'VacuumToaster',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    update(elapsed, dirty) {
        dirty |= this.strategy.update(elapsed);
        this.lamp.local_transform.roll(1.5*elapsed);
        
        
        if (this.look_at) {
            var target_vector = vec3.create();
            vec3.sub(target_vector, this.look_at, this.getWorldPosition());
            var forward_vector = down(this.getWorldTransform());
            target_vector[1] = 0;
            forward_vector[1] = 0;
            target_vector[2] = 0;
            forward_vector[2] = 0;
            var angle = rad2deg(vec3.angle(target_vector, forward_vector));

            if (Math.abs(angle) > 0.5) {
                var angle_increment = Math.sign(angle) * Math.min(Math.abs(angle), this.rotation_speed * elapsed);
                this.local_transform.roll(angle_increment);
                dirty = true;
            }
        }

        super.update(elapsed, dirty);
        
    }
}


classes.VacuumToaster = VacuumToaster;