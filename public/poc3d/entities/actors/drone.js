'use strict'

class Drone extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.scene = parent;
        this.local_position = position;
        this.type = PickableType.Enemy;
        this.body = new Drawable(this, [0, 0, 0], models.lamp_boss.body);
        this.motors = new Drawable(this, [0, 0, 0], models.lamp_boss.motors);
        this.fans = [
            new Drawable(this, [0.22, -0.22, 0], models.lamp_boss.fan),
            new Drawable(this, [0.22, 0.22, 0], models.lamp_boss.fan),
            new Drawable(this, [-0.22, -0.22, 0], models.lamp_boss.fan),
            new Drawable(this, [-0.22, 0.22, 0], models.lamp_boss.fan)
        ];
        this.local_transform.scaleUniform(0.8);
        
        this.body.material = materials.metall;
        
        this.fans.forEach(fan => {
            fan.local_transform.roll(Math.random()*360);
            fan.material = materials.rubber;
        });
        
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.6, 0.5);
        this.stats = {
            movement_speed: 0.002,
            acceleration: 0.00008,
            dmg: 1,
            dmg_cooldown: 3000,
            patrol_tolerance: 0.3,
            max_health: 1
        };
        this.health = this.stats.max_health;
        this.strategy = new PatrolStrategy(this);
        this.blinking_drawables_on_damage = [this.body, this.motors];
    }
    
    toJSON(key) {
        return {
            class: 'Drone',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    update(elapsed, dirty) {
        dirty |= this.strategy.update(elapsed);
        super.update(elapsed, dirty);
    }

    draw(renderer) {
        if(debug && this.path) {
            this.path.forEach(point => {
                debugDraw(renderer, point);
            });
        }
        super.draw(renderer);
    }

}


classes.Drone = Drone;