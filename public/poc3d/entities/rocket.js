'use strict'

class Rocket extends Drawable {
    constructor(position, point, speed, instigator) {
        super(null, position);
        //this.local_transform.yaw(yaw);
        this.lookAtInstantly(point);
        this.model = models.box;
        this.material = materials.metall;
        this.fire = new Fire(this, [0, 0, 0]);
        //console.log(this.velocity);
        //this.fire.local_transform.setPitch(-90);
        this.elapsed = 0;
        this.stats = {
            life_time: 1000,
            speed: speed
        }
        this.velocity = forward(this.local_transform.get());
        vec3.scale(this.velocity, this.velocity, this.stats.speed);
        this.instigator = instigator;
        this.colliders.push(new Collider(this, [0, 0, 0], CollisionTypes.Projectile, 0.1, 0.1));
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
        if (other != this.instigator && other.collider.type != CollisionTypes.Projectile) {
            this.explode();
            if (other.collider.type == CollisionTypes.Actor) {
                other.takeDamage(this.dmg);
            }
        }
    }
}