class WaterSplash extends ParticleSystem {
    constructor(parent, local_position, direction, particle_count, spread) {
        super(parent, local_position);
        this.direction = direction || [0, 0, -1];
        this.continuous = false;
        this.spread = spread || 0.35;
        this.min_speed = 0.001;
        this.max_speed = 0.002;
        this.particle_life_time = 900;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: normalizeColor([29, 95, 115]), scale: 0.22};
        this.stop = {color: normalizeColor([190, 228, 255]), scale: 0};
        this.setParticleCount(particle_count || 25);
        console.log(this.local_position)
    }
}