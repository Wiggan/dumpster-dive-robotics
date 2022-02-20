'use strict'

class Rocket extends DynamicEntity {
    constructor(position, forward, speed, instigator) {
        super(null, position);
        this.drawable = new Drawable(this, [0, 0, 0], models.ball);
        this.drawable.material = materials.metall;
        
        this.elapsed = 0;
        this.stats = {
            life_time: 1000,
            speed: speed,
            dmg: 1
        }
        this.velocity = forward;
        var fire_dir = vec3.clone(this.velocity);
        vec3.scale(fire_dir, fire_dir, -1);
        vec3.normalize(fire_dir, fire_dir);
        this.fire = new Fire(this, [0, 0, 0], fire_dir);
        vec3.normalize(this.velocity, this.velocity);
        vec3.scale(this.velocity, this.velocity, this.stats.speed);
        this.instigator = instigator;
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Projectile, 0.1, 0.1);
        game.scene.entities.push(this);
        this.sound = new SFX(this, [0,0,0], sfx.rocket_flying);
    }

    update(elapsed, dirty) {
        if (this.elapsed > this.stats.life_time) {
            this.explode();
        }
        this.elapsed += elapsed;
        super.update(elapsed, true);
    }

    explode() {
        var direction = vec3.clone(this.velocity);
        vec3.scale(direction, direction, -1);
        vec3.normalize(direction, direction);
        console.log(direction);
        game.scene.entities.push(new FirePuff(null, this.getWorldPosition(), direction));
        game.scene.entities.push(new Smoke(null, this.getWorldPosition(), direction));
        this.sound.stop();
        this.sound = new SFX(this, [0,0,0], sfx.rocket_exploding);
        game.scene.remove(this);
    }

    onCollision(other) {
        if (other.parent != this.instigator && other.type != CollisionLayer.Projectile) {
            if (other.type == CollisionLayer.Enemy && this.instigator == player) {
                other.parent.takeDamage(this.stats.dmg, this.instigator, this.collider);
            } else if (other.type == CollisionLayer.Player && this.instigator != player) {
                other.parent.takeDamage(this.stats.dmg, this.instigator, this.collider);
            }
            this.explode();
        }
    }
}