class PowerUpParticles extends ParticleSystem {
    constructor(parent, local_position, direction) {
        super(parent, local_position);
        this.direction = direction || [0, 0, -1];
        this.continuous = true;
        this.spread = 0.08;
        this.min_speed = 0.001;
        this.max_speed = 0.005;
        this.particle_life_time = 400;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [0, 1, 0.42], scale: 0.034};
        this.stop = {color: [1.0, 0.23, 0], scale: 0.022};
        this.setParticleCount(10);
    }
}