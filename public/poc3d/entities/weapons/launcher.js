'use strict'

class Launcher extends DynamicEntity {
    constructor(parent) {
        super(parent, [0, 0, 0]);
        this.drawable = new Drawable(this, [0,0,0], models.player.rocket_launcher);
        this.drawable.material = materials.player;
        this.lamp = new Drawable(this, [0, 0, 0], models.box);
        this.lamp.material = materials.green_led;
        this.lamp.local_transform.scaleUniform(0.05);
        this.stats = {
            damage: 1,
            cooldown: 500
        }
        this.cooldown = 0;
    }

    fire() {
        if (this.cooldown == 0) {
            var pos = this.getWorldPosition();
            var f = right(this.getWorldTransform());
            vec3.scale(f, f, 0.3);
            vec3.add(pos, pos, f);
            vec3.add(pos, pos, [0, 0, -0.5]);

            new Rocket(pos, f, 0.01, player);
            this.cooldown = this.stats.cooldown;
            this.lamp.material = materials.red_led;
            //this.sound = new SFX(this, [0,0,0], sfx.launch);
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
