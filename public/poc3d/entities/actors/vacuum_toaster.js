'use strict'

class Toast extends ProjectileBase {
    constructor(position, forward, instigator) {
        super(position, instigator, sfx.rocket_flying);
        this.drawable = new Drawable(this, [0, 0, 0], models.box);
        this.drawable.material = materials.red_led; 
        
        this.drawable.local_transform.scale([0.2, 0.05, 0.2]);
        this.force = [0, 0, constants.gravity];

        this.stats.speed = 0.01;
        this.velocity = forward;
        vec3.normalize(this.velocity, this.velocity);
        vec3.scale(this.velocity, this.velocity, this.stats.speed);
    }

    explode() {
        var direction = vec3.clone(this.velocity);
        vec3.scale(direction, direction, -1);
        vec3.normalize(direction, direction);
        game.scene.entities.push(new Smoke(null, this.getWorldPosition(), direction, 10));
        super.explode();
    }
}

class Toaster extends DynamicEntity {
    constructor(parent, position) {
        super(parent, position);
        this.drawable = new Drawable(this, [0,0,0], models.vacuum_fan.toaster);
        this.drawable.material = materials.player;
        this.lamp = new Drawable(this, [0.1, 0, -0.30], models.box);
        this.lamp.material = materials.yellow_led;
        this.lamp.local_transform.scale([0.015, 0.18, 0.015]);
        this.stats = {
            cooldown: 500
        }
        this.cooldown = this.stats.cooldown + Math.random()*1500;
        this.instigator = parent;
        this.launch_points = [new Entity(this, [0.3, 0.1, -0.5]), new Entity(this, [0.3, -0.1, -0.5])];
        this.launch_points[0].local_transform.yaw(20);
        this.launch_points[1].local_transform.yaw(40);
    }

    fire() {
        if (this.cooldown == 0 && this.parent.health > 0) {
            this.launch_points.forEach(launch_point => {
                var pos = launch_point.getWorldPosition();
                var f = right(launch_point.getWorldTransform());
                f[1] = 0;
                vec3.normalize(f, f);
    
                new Toast(pos, f, this.instigator);
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