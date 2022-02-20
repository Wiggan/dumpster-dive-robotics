'use strict'

class FirePuff extends ParticleSystem {
    constructor(parent, local_position, direction) {
        super(parent, local_position);
        this.direction = direction || [0,1,0];
        this.continuous = false;
        this.spread = 0.3;
        this.min_speed = 0.0005;
        this.max_speed = 0.0018;
        this.particle_life_time = 800;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [1.0, 0.0, 0.0], scale: 0.3};
        this.stop = {color: [1.0, 0.6, 0.0], scale: 0};
        this.setParticleCount(16);
    }
}

class Fire extends ParticleSystem {
    constructor(parent, local_position, direction) {
        super(parent, local_position);
        this.direction = direction || [0,1,0];
        this.continuous = true;
        this.spread = 0.3;
        this.min_speed = 0.0005;
        this.max_speed = 0.0018;
        this.particle_life_time = 60;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [1.0, 0.0, 0.0], scale: 0.2};
        this.stop = {color: [1.0, 0.6, 0.0], scale: 0};
        this.setParticleCount(16);
    }
}
