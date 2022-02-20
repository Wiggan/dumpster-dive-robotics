'use strict';

class CeilingCannon extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Background(this, [0, 0, 0]);
        this.launcher = new Launcher(this);
        this.launcher.local_transform.yaw(-90);
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