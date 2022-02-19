'use strict'

class LampBoss extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.position = position;
        this.type = PickableType.Enemy;
        this.body = new Drawable(this, [0, 0, 0], models.lamp_boss.body);
        this.led_list = new Drawable(this, [0, 0, 0], models.lamp_boss.led_list);
        this.motors = new Drawable(this, [0, 0, 0], models.lamp_boss.motors);
        this.fans = [
            new Drawable(this, [0.22, -0.22, 0], models.lamp_boss.fan),
            new Drawable(this, [0.22, 0.22, 0], models.lamp_boss.fan),
            new Drawable(this, [-0.22, -0.22, 0], models.lamp_boss.fan),
            new Drawable(this, [-0.22, 0.22, 0], models.lamp_boss.fan)
        ];

        this.led_list.material = materials.red_led;
        this.body.material = materials.metall;
        
        this.fans.forEach(fan => {
            fan.local_transform.roll(Math.random()*360);
            fan.material = materials.rubber;
        });
        
        this.lamp = new PointLight(this, position, parent);
        this.lamp.constant = LanternLight.Constant;
        this.lamp.linear = LanternLight.Linear;
        this.lamp.quadratic = LanternLight.Quadratic;
        this.lamp.active = true;

        this.lamp.drawable = new Drawable(this, [0, 0, 0], models.lamp_boss.head_lamp);
        this.lamp.drawable.material = materials.light;
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.8, 0.4);
        this.stats = {
            movement_speed: 0.002,
            dmg: 1
        };
        this.strategy = new PatrolStrategy(this);
    }
    
    toJSON(key) {
        return {
            class: 'LampBoss',
            strategy: this.strategy,
            local_position: this.position,
        }
    }

    update(elapsed, dirty) {
        dirty |= this.strategy.update(elapsed);
        this.fans.forEach(fan => {
            fan.local_transform.roll(1.8*elapsed);
        });

        super.update(elapsed, dirty);
        
    }
}


classes.LampBoss = LampBoss;