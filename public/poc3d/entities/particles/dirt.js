class Dirt extends ParticleSystem {
    constructor(parent, local_position, direction, particle_count, spread) {
        super(parent, local_position);
        this.direction = direction || [0, 1, 0];
        this.continuous = false;
        this.spread = spread || 0.16;
        this.min_speed = 0.0007;
        this.max_speed = 0.0021;
        this.particle_life_time = 250;
        this.start_randomly = false;
        this.ended_callback = undefined;
        this.start = {color: normalizeColor([63, 39, 12]), scale: 0.2};
        this.stop = {color: normalizeColor([78, 56, 24]), scale: 0};
        this.setParticleCount(particle_count);
    }
}