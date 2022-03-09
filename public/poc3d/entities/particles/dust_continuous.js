class DustContinuous extends ParticleSystem {
    constructor(parent, local_position, direction, particle_count, spread) {
        super(parent, local_position);
        this.direction = direction || [0, 1, 0];
        this.continuous = true;
        this.spread = spread || 0.16;
        this.min_speed = 0.002;
        this.max_speed = 0.0041;
        this.particle_life_time = 250;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: normalizeColor([33, 39, 32]), scale: 0.04};
        this.stop = {color: normalizeColor([28, 26, 24]), scale: 0};
        this.setParticleCount(particle_count);
    }
}