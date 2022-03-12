'use strict'

class ProjectileBase extends DynamicEntity {
    constructor(position, instigator, sound) {
        super(null, position);
        this.elapsed = 0;
        this.stats = {
            life_time: 1000,
            dmg: 1
        }
        this.velocity = [0, 0, 0];
        this.force = undefined;
        this.instigator = instigator;
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Projectile, 0.1, 0.1);
        game.scene.entities.push(this);
        this.sound = new SFX(this, [0,0,0], sound);
        this.hasExploded = false;
    }

    toJSON(key) {
        return "";
    }

    update(elapsed, dirty) {
        var step_length = 1;
        if (this.elapsed > this.stats.life_time) {
            this.explode();
        }
        this.elapsed += elapsed;
        var max = Math.ceil(elapsed/step_length);
        for (var i = 0; i < max; i++) {
            if (i == Math.ceil(elapsed/step_length) - 1) {
                // Last round, use modulo for last step
                step_length = elapsed % i;
            }
            if (this.force) {
                var at = vec3.create();
                vec3.scale(at, this.force, step_length);
                vec3.add(this.velocity, this.velocity, at);
            }
            super.update(step_length, true);
        }
    }

    explode() {
        this.sound.stop();
        this.sound = new SFX(this, [0,0,0], sfx.rocket_exploding);
        game.scene.remove(this);
        this.hasExploded = true;
    }

    onCollision(other) {
        if (other.parent != this.instigator && other.type != CollisionLayer.Projectile) {
            if (other.type == CollisionLayer.Enemy && this.instigator == player) {
                if (other.parent.takeDamage) {
                    other.parent.takeDamage(this.instigator.stats.dmg, this.instigator, this.collider);
                    if (this.hasExploded == false) this.explode();
                } else {
                    console.log("Hopefully flame?");
                }
            } else if (other.type == CollisionLayer.Player) {
                other.parent.takeDamage(this.instigator.stats.dmg, this.instigator, this.collider);
                if (this.hasExploded == false) this.explode();
            } else {
                if (this.hasExploded == false) this.explode();
            }
        }
    }
}