'use strict'

class Launcher extends DynamicEntity {
    constructor(parent) {
        super(parent, [0, 0, 0]);
        this.drawable = new Drawable(this, [0,0,0], models.player.rocket_launcher);
        this.drawable.material = materials.player;
        this.lamp = new Drawable(this, [0, 0, -0.50], models.box);
        this.lamp.material = materials.green_led;
        this.lamp.local_transform.scale([0.015, 0.38, 0.015]);
        this.stats = {
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
            this.sound = new SFX(this, [0,0,0], sfx.launch);
        }
    }

    update(elapsed, dirty) {
        // Update direction based on pointer
        if (player.camera.pointing_at[0] < this.getWorldPosition()[0]) {
            this.local_transform.setRoll(180);
        } else {
            this.local_transform.setRoll(0);
        }

        this.cooldown = Math.max(0, this.cooldown - elapsed);
        if (this.cooldown == 0) {
            this.lamp.material = materials.green_led;
        }
        super.update(elapsed, dirty);
    }
}
