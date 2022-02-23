'use strict'

class HeadLampPowerUp extends Pickable {
    constructor(position) {
        super(null, position);
        this.position = position;
        this.drawable = new Drawable(this, [0, 0, 0], models.powerups.head_lamp);
        this.drawable.material = materials.light_inactive;
        this.drawable.id = this.id;
        this.particles = new PowerUpParticles(this, [0, 0 ,0]);
        this.item = items.lamp;
        this.label = this.item.name;
        game.scene.entities.push(this);
        this.elapsed = 0;
    }

    interact() {
        player.pickUp(this.item);
        game.scene.remove(this);
    }

    toJSON(key) {
        return '';
    }


    update(elapsed, dirty) {
        this.elapsed += elapsed;
        var pos = vec3.create();
        vec3.add(pos, this.position, [0, 0, Math.sin(this.elapsed*0.008)*0.05]);
        this.local_transform.setPosition(pos);
        this.local_transform.roll(elapsed * 0.08);
        dirty = true;
        super.update(elapsed, dirty);
    }
}