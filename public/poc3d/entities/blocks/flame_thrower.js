'use strict' 


class Flame extends ParticleSystem {
    constructor(parent, local_position, direction, life_time) {
        super(parent, local_position);
        this.direction = direction || [0,1,0];
        this.continuous = true;
        this.spread = 0.02;
        this.min_speed = 0.006;
        this.max_speed = 0.0078;
        this.particle_life_time = life_time;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [1.0, 0.0, 0.0], scale: 0.2};
        this.stop = {color: [1.0, 0.6, 0.0], scale: 0};
        this.setParticleCount(50);
    }
}

class FlameThrower extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Background(this, [0, 0, 0]);
        this.drawable = new Drawable(this, [0, 0, 0], models.ceiling_cannon);
        this.yaw = 0;
        this.range = 6;
        this.stats = {
            dmg: 1,
        };
    }
    
    init(scene) {
        if (this.yaw == 90) {
            this.collider = new Collider(this, [this.range/2, 0, 0], CollisionLayer.Sensor, this.range, 0.4);
        } else if (this.yaw == 180) {
            this.collider = new Collider(this, [0, 0, this.range/2], CollisionLayer.Sensor, 0.4, this.range);
        } else if (this.yaw == 270) {
            this.collider = new Collider(this, [-this.range/2, 0, 0], CollisionLayer.Sensor, this.range, 0.4);
        } else {
            this.collider = new Collider(this, [0, 0, -this.range/2], CollisionLayer.Sensor, 0.4, this.range);
        }
        this.drawable.local_transform.yaw(this.yaw);
        scene.colliders.push(this.collider);
    }
    
    stop_triggering() {
        this.collider.type = CollisionLayer.Sensor;
        this.flame.continuous = false;
        this.flame.ended_callback = () => {
            this.removeChild(this.flame);
            this.flame = undefined;
        }
    }
    
    start_triggering() {
        var dir = [0, 0, -1];
        if (this.yaw == 90) {
            dir = [1, 0, 0];
        } else if (this.yaw == 180) {
            dir = [0, 0, 1];
        } else if (this.yaw == 270) {
            dir = [-1, 0, 0];
        }
        if (this.flame) {
            this.removeChild(this.flame);
        }
        this.flame = new Flame(this, [0, 0, 0], dir, this.range*100);
        this.collider.type = CollisionLayer.Enemy;
/*         window.setTimeout(() => {
        }, 100); */
    }

    toJSON(key) {
        return {
            class: 'FlameThrower',
            uuid: this.uuid,
            local_position: this.local_position,
            range: this.range,
            yaw: this.yaw
        }
    }
}

classes.FlameThrower = FlameThrower;