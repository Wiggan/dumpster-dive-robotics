'use strict'

class Drone extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.position = position;
        this.type = PickableType.Enemy;
        this.body = new Drawable(this, [0, 0, 0], models.box);
        this.lamp = new Drawable(this, [0, 0, 0], models.box);
        this.lamp.material = materials.red_led;
        this.lamp.id = this.id;
        this.body.material = materials.player;
        this.body.id = this.id;
        this.fire = new Fire(this, [0, 0.5, 0]);
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.4, 0.4);
        this.tolerance = 0.1;
        this.stats = {
            movement_speed: 0.001,
            dmg: 1
        };
        this.strategy = new PatrolStrategy(this);
    }
    
    toJSON(key) {
        return {
            class: 'Drone',
            strategy: this.strategy,
            local_position: this.position,
        }
    }

    update(elapsed, dirty) {
        dirty |= this.strategy.update(elapsed);
        super.update(elapsed, dirty);
        var pos = vec3.create();
        vec3.add(pos, this.getLocalPosition(), [0, Math.sin(Date.now()*0.005)*0.005, 0]);
        this.local_transform.setPosition(pos);
    }
}


classes.Drone = Drone;