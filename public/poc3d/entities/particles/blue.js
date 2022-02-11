class Blue extends ParticleSystem {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.direction = [0, 0.5, 0.5];
        this.continuous = true;
        this.spread = 0.1;
        this.min_speed = 0.00001;
        this.max_speed = 0.00006;
        this.particle_life_time = 2000;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [0, 0, 0.7], scale: 0.05};
        this.stop = {color: [0.7, 0.7, 1.0], scale: 0};
        this.setParticleCount(50);
    }
}