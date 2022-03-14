'use strict'

class WaterBoss extends BossBase {
    constructor(parent, position) {
        super(parent, position, CounterPressurizerPowerUp);
        this.base = new DynamicEntity(this, [0, 0, 0]);
        this.base.drawable = new Drawable(this.base, [0, 0, 0.505], models.water_boss.base);
        this.propeller = new Drawable(this.base, [0, 0, 0.505], models.water_boss.propeller);
        this.base.local_transform.scaleUniform(0.5);
        
        this.launcher = new Launcher(this);
        this.launcher.launch_point.local_transform.setPosition([0.33, 0, 0]);
        this.launcher.drawable.model = models.water_boss.launcher;
        this.launcher.lamp.local_transform.setPosition([0.3, 0.3, 0]);
        this.launcher.lamp.local_transform.scale([0.015, 0.18, 0.015]);
        
        this.propeller.material = materials.rubber;
        this.base.drawable.material = materials.metall;
        
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.6, 0.9);
    
        this.stats.jump_speed = 0.01;
        this.stats.movement_speed = 0.003;
        this.stats.vertical_movement_speed = 0.01;
        this.stats.acceleration = 0.000012;
        this.stats.dmg = 1;
        this.stats.patrol_tolerance = 0.1;
        this.stats.max_health = 4;
        this.health = this.stats.max_health;
        this.strategy = new BossStrategy(this, [0.1, 0.3]);
        this.blinking_drawables_on_damage = [this.base, this.propeller, this.launcher.drawable];
    }
    
    toJSON(key) {
        return {
            class: 'WaterBoss',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    attack(position) {
        console.log("Attacking");
        this.attack_done = false;
        new SFX(this, [0, 0, 0], sfx.attack);
        if (Math.random() < 0.75) {
            this.launcher.lookAtInstantly(player.getWorldPosition());
            this.shot_fired = false;
            this.force[2] = 0;
            this.velocity[2] = -this.stats.jump_speed * (1 - Math.random()*0.4);
            var position = [0, 0, 0.45];
            new Dirt(this, position, [0, 0, -1], 10, 0.4);
            window.setTimeout(() => {
                this.attack_done = true;
                this.launcher.lookAtInstantly(player.getWorldPosition());
            }, 3000);
        } else {
            var up = this.getWorldPosition();
            up[2] -= 1;
            this.launcher.lookAtInstantly(up);
            new HomingRocket(this.launcher.launch_point.getWorldPosition(), this, player);
            new HomingRocket(this.launcher.launch_point.getWorldPosition(), this, player);
            window.setTimeout(() => {
                this.attack_done = true;
                this.launcher.lookAtInstantly(player.getWorldPosition());
            }, 1000);
        }
    }

    update(elapsed, dirty) {

        this.propeller.local_transform.roll(elapsed * Math.max(1, vec3.length(this.velocity) * 500));

        var direction = this.base.getWorldPosition();
        if (this.velocity[0] > 0.00001) {
            vec3.add(direction, direction, [0.01, 0, 1]);
            this.base.look_at = direction;
        } else if (this.velocity[0] < -0.00001) {
            vec3.add(direction, direction, [0.01, 0, -1]);
            this.base.look_at = direction;
        } else {
            vec3.add(direction, direction, [1, 0, 0]);
            this.base.look_at = direction;
        }


        if (1 > this.getWorldPosition()[2] && this.getWorldPosition()[2] > 0 && this.velocity[2] > 0) {
            console.log("hej");
            this.force[2] = constants.gravity * 0.2;
            this.velocity[2] *= 0.9;
        } else if (this.getWorldPosition()[2] < 1) {
            this.force[2] = constants.gravity * 0.2;
        } else {
            this.force[2] = 0;
            this.local_transform.setPosition([this.getWorldPosition()[0], 0, 1]);
        }



        if (!this.attack_done && !this.shot_fired && this.velocity[2] > 0.00001) {
            this.launcher.fire();
            this.shot_fired = true;
        }

        dirty |= this.strategy.update(elapsed);

        super.update(elapsed, dirty);
    }
}


classes.WaterBoss = WaterBoss;