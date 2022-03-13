'use strict'

class LightningParticles extends ParticleSystem {
    constructor(parent, local_position, direction, count) {
        super(parent, local_position);
        this.direction = direction || [0, 1, 0];
        this.continuous = true;
        this.spread = 1;
        this.min_speed = 0.001;
        this.max_speed = 0.004;
        this.particle_life_time = 100;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [1.0, 1.0, 1.0], scale: 0.04};
        this.stop = {color: [0.2, 0.3, 1.0], scale: 0.01};
        this.setParticleCount(count || 100);
    }
}

class LightnintBolt extends ProjectileBase {
    constructor(position, instigator, path) {
        super(position, instigator, sfx.rocket_flying);
/*         this.drawable = new Drawable(this, [0, 0, 0], models.ball);
        this.drawable.material = materials.green_led; */
        this.path = path;
        this.path_index = 0;
        this.world_target_position = this.path[this.path_index];
        this.stats.speed = 0.01;
        this.stats.patrol_tolerance = 0.2;
        this.stats.life_time = 2000;
        this.lightning = new LightningParticles(this, [0, 0, 0]);
        this.step_length = 1;
    }

    explode() {
        super.explode();
        //game.scene.entities.push(this.lightning);
    }

    update(elapsed, dirty) {
        if (this.path) {
            if (vec3.dist(this.world_target_position, this.getWorldPosition()) < this.stats.patrol_tolerance) {
                this.path_index++;
                if (!this.path[this.path_index]) {
                    console.log("Lightning bolt reached end of path");
                    this.path = undefined;
                    this.world_target_position = undefined;
                    this.explode();
                } else {
                    this.world_target_position = this.path[this.path_index];
                }
            }
        }

        if (this.world_target_position) {
            var direction = vec3.create();
            vec3.subtract(direction, this.world_target_position, this.getWorldPosition());
            vec3.normalize(direction, direction);
            var back = vec3.create();
            vec3.scale(back, direction, -1);
            this.lightning.direction = back;

            vec3.scale(this.velocity, direction, this.stats.speed);
        }
        super.update(elapsed, dirty);
    }
    
    draw(renderer) {
        if(debug && this.path) {
            this.path.forEach(point => {
                debugDraw(renderer, point);
            });
        }
        super.draw(renderer);
    }

}

class BatteryBoss extends BossBase {
    constructor(parent, position) {
        super(parent, position, BatteryPowerUp); 
        this.base = new Drawable(this, [0, 0, 0.25], models.battery_boss.base);
        this.battery = new Drawable(this.base, [0, 0, 0], models.battery_boss.battery);
        this.charger = new Drawable(this.base, [0, 0, 0], models.battery_boss.charger);

        this.base.material = materials.blue;
        this.battery.material = materials.metall;
        this.charger.material = materials.metall;

        this.stats.patrol_tolerance = 0.1;
        this.stats.max_health = 4;
        this.health = this.stats.max_health;

        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.8, 0.8);

        this.blinking_drawables_on_damage = [this.base, this.charger, this.battery];
        this.strategy = new BossStrategy(this, [0.1, 0.6]);
    }
    
    toJSON(key) {
        return {
            class: 'BatteryBoss',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    attack(position) {
        new SFX(this, [0, 0, 0], sfx.attack);
        this.attack_done = false;
        this.goto(position);
        var path = JSON.parse(JSON.stringify(this.path));
        var source_location = [-0.08, 0, -0.5];
        this.lightning = new LightningParticles(this.base, source_location);
        this.path = undefined;
        this.world_target_position = undefined;
        window.setTimeout(() => {
            var world_source_location = vec3.create();
            vec3.add(world_source_location, this.getWorldPosition(), source_location);
            new LightnintBolt(world_source_location, this, path);
            this.base.removeChild(this.lightning);
            this.attack_done = true;
        }, 800);
    }

}


classes.BatteryBoss = BatteryBoss;