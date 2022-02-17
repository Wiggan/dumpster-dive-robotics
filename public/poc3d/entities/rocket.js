'use strict'

class Rocket extends DynamicEntity {
    constructor(position, forward, speed, instigator) {
        super(null, position);
        //this.local_transform.yaw(yaw);
        //this.lookAtInstantly(forward);
        this.drawable = new Drawable(this, [0, 0, 0], models.ball);
        this.drawable.material = materials.metall;
        
        this.elapsed = 0;
        this.stats = {
            life_time: 1000,
            speed: speed
        }
        this.velocity = forward; //forward(this.local_transform.get());
        var fire_dir = vec3.clone(this.velocity);
        vec3.scale(fire_dir, fire_dir, -1);
        vec3.normalize(fire_dir, fire_dir);
        this.fire = new Fire(this, [0, 0, 0], fire_dir);
        vec3.normalize(this.velocity, this.velocity);
        vec3.scale(this.velocity, this.velocity, this.stats.speed);
        this.instigator = instigator;
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Projectile, 0.1, 0.1);
        game.scene.entities.push(this);
        this.dmg = 20;
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
        game.scene.remove(this);
        var direction = vec3.clone(this.velocity);
        vec3.scale(direction, direction, -1);
        vec3.normalize(direction, direction);
        game.scene.entities.push(new FirePuff(null, this.getWorldPosition(), direction));
        game.scene.entities.push(new Smoke(null, this.getWorldPosition()));
        this.sound.stop();
        this.sound = new SFX(this, [0,0,0], sfx.rocket_exploding);
    }

    onCollision(other) {
        if (other.parent != this.instigator && other.type != CollisionLayer.Projectile) {
            this.explode();
            if (other.type == CollisionLayer.Actor) {
                other.parent.takeDamage(this.dmg);
            }
        }
    }
}