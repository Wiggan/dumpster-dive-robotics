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
        this.instigator = parent;
        this.launch_point = new Entity(this, [0.3, 0, -0.5]);
    }

    fire() {
        if (this.cooldown == 0) {
            var pos = this.launch_point.getWorldPosition();
            var f = right(this.getWorldTransform());

            new Rocket(pos, f, 0.01, this.instigator);
            this.cooldown = this.stats.cooldown;
            this.lamp.material = materials.yellow_led;
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
