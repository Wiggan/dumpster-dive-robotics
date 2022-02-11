'use strict'

class DoubleLauncher extends Drawable {
    constructor(parent) {
        super(parent, [0, 0, 0], models.box);
        this.material = materials.player;
        this.lamp = new Drawable(this, [0, 0, 0], models.box);
        this.lamp.material = materials.green_led;
        this.stats = {
            damage: 1,
            cooldown: 800
        }
        this.cooldown = 0;
    }

    fire(point) {
        if (this.cooldown == 0) {
            var pos1 = this.getWorldPosition();
            var pos2 = this.getWorldPosition();
            var f = forward(this.getWorldTransform());
            vec3.scale(f, f, 0.5);
            var r = right(this.getWorldTransform());
            vec3.scale(r, r, 0.1);

            vec3.add(pos1, pos1, f);
            vec3.add(pos1, pos1, r);
            vec3.add(pos2, pos2, f);
            vec3.sub(pos2, pos2, r);
            new Rocket(pos1, point, 0.008, player);
            new Rocket(pos2, point, 0.008, player);
            this.cooldown = this.stats.cooldown;
            this.lamp.material = materials.red_led;
            this.sound = new SFX(this, [0,0,0], sfx.launch);
        }
    }

    update(elapsed, dirty) {
        this.cooldown = Math.max(0, this.cooldown - elapsed);
        if (this.cooldown == 0) {
            this.lamp.material = materials.green_led;
        }
        super.update(elapsed, dirty);
    }
}
