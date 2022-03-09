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
            this.sound = new SFX(this, [0,0,0], sfx.toast);
        }
    }

    update(elapsed, dirty) {

        this.cooldown = Math.max(0, this.cooldown - elapsed);
        if (this.cooldown == 0 && this.lamp.material == materials.yellow_led) {
            this.lamp.material = materials.green_led;
            window.setTimeout(() => {
                this.fire();
            }, 1500);
        }
        super.update(elapsed, dirty);
    }
}


class VacuumToaster extends VacuumBase {
    constructor(parent, position) {
        super(position);
        this.toaster = new Toaster(this, [0, 0, 0.45], models.vacuum_fan.toaster);
        this.toaster.material = materials.metall;
        this.collider = new Collider(this, [0, 0, 0.05], CollisionLayer.Enemy, 0.3, 0.7);
        this.blinking_drawables_on_damage.push(this.toaster)

    }
    
    toJSON(key) {
        return {
            class: 'VacuumToaster',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }
}


classes.VacuumToaster = VacuumToaster;