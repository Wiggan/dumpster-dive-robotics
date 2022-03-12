class Smoke extends ParticleSystem {
    constructor(parent, local_position, direction, count) {
        super(parent, local_position);
        this.direction = direction || [0, 1, 0];
        this.continuous = false;
        this.spread = 0.24;
        this.min_speed = 0.0003;
        this.max_speed = 0.0022;
        this.particle_life_time = 1000;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: normalizeColor([23, 23, 23]), scale: 0.2};
        this.stop = {color: [0.0, 0.0, 0.0], scale: 0};
        this.setParticleCount(count || 22);
    }
}