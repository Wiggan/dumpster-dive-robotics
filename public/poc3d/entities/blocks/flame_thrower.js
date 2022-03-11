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
        this.drawable.local_transform.yaw(90);
        this.range = 6;
        this.stats = {
            dmg: 1,
        };
    }
    
    init(scene) {
        this.collider = new Collider(this, [this.range/2, 0, 0.2], CollisionLayer.Sensor, this.range, 0.2);
        scene.colliders.push(this.collider);
    }
    
    stop_triggering() {
        this.collider.type = CollisionLayer.Sensor;
        this.flame.continuous = false;
    }
    
    start_triggering() {
        this.flame = new Flame(this, [0, 0, 0], [1, 0, 0], this.range*100);
        window.setTimeout(() => {
            this.collider.type = CollisionLayer.Enemy;
        }, 100);
    }

    takeDamage() {}

    toJSON(key) {
        return {
            class: 'FlameThrower',
            uuid: this.uuid,
            local_position: this.local_position,
            range: this.range
        }
    }
}

classes.FlameThrower = FlameThrower;