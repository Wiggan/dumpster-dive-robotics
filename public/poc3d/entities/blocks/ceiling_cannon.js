'use strict';

class CeilingCannon extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Background(this, [0, 0, 0]);
        this.launcher = new Launcher(this);
        this.launcher.drawable.model = models.ceiling_cannon;
        this.launcher.drawable.local_transform.yaw(90);
        this.launcher.local_transform.yaw(-90);
        this.launcher.lamp.local_transform.scale([0.015, 0.45, 0.015]);
        this.launcher.lamp.local_transform.setPosition([0, 0, 0]);
        this.launcher.stats.cooldown = 2000;
    }

    stop_triggering() {
    }
    
    start_triggering() {
        this.launcher.fire();
    }
    
    toJSON(key) {
        return {
            class: 'CeilingCannon',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}

classes.CeilingCannon = CeilingCannon;