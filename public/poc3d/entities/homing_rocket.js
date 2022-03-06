'use strict'

class HomingRocket extends DynamicEntity {
    constructor(position, instigator, target) {
        super(null, position);
        console.log("Homing rocket!");
        this.target = target;
        this.stats = {
            life_time: 500 + Math.random()*100,
            speed: 0.02 + Math.random()*0.004
        }
        this.drawable = new Drawable(this, [0, 0, 0], models.ball);
        this.drawable.material = materials.red_led;
        this.instigator = instigator;
        this.velocity = [0, 0, -1];
        vec3.scale(this.velocity, this.velocity, this.stats.speed);
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Projectile, 0.1, 0.1);
        game.scene.entities.push(this);
        this.sound = new SFX(this, [0,0,0], sfx.rocket_flying);
        this.elapsed = 0;
        this.force = [0, 0, constants.gravity];
        this.blink_interval = window.setInterval(() => {
            this.drawable.material = (this.drawable.material == materials.red_led) ?  materials.metall : materials.red_led;
        }, 100);
    }

    update(elapsed, dirty) {
        
        // Accelerate
        var at = vec3.create();
        vec3.scale(at, this.force, elapsed);
        vec3.add(this.velocity, this.velocity, at);

        if (this.elapsed > this.stats.life_time) {
            this.fire();
        }
        this.elapsed += elapsed;
        super.update(elapsed, true);
    }

    fire() {
        this.lookAtInstantly(this.target.getWorldPosition());
        var pos = this.getWorldPosition();
        var f = right(this.getWorldTransform());
        new Rocket(pos, f, 0.01, this.instigator);
        game.scene.remove(this);
        window.clearInterval(this.blink_interval);
    }

    onCollision(other) {
        if (other.parent != this.instigator && other.type != CollisionLayer.Projectile) {
            this.fire();
        }
    }
}