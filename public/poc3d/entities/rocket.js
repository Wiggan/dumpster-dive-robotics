'use strict'

class Rocket extends ProjectileBase {
    constructor(position, forward, speed, instigator) {
        super(position, instigator, sfx.rocket_flying);
        this.drawable = new Drawable(this, [0, 0, 0], models.ball);
        this.drawable.material = materials.metall;
        
        this.stats.speed =speed;
        this.velocity = forward;
        var fire_dir = vec3.clone(this.velocity);
        vec3.scale(fire_dir, fire_dir, -1);
        vec3.normalize(fire_dir, fire_dir);
        this.fire = new Fire(this, [0, 0, 0], fire_dir);
        vec3.normalize(this.velocity, this.velocity);
        vec3.scale(this.velocity, this.velocity, this.stats.speed);
    }

    explode() {
        var direction = vec3.clone(this.velocity);
        vec3.scale(direction, direction, -1);
        vec3.normalize(direction, direction);
        //console.log(direction);
        game.scene.entities.push(new FirePuff(null, this.getWorldPosition(), direction));
        game.scene.entities.push(new Smoke(null, this.getWorldPosition(), direction));
        super.explode();
    }
}