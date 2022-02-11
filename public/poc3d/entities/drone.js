'use strict'

class Drone extends Pickable {
    constructor(parent, position) {
        super(null, position);
        this.position = position;
        this.type = PickableType.Enemy;
        this.body = new Drawable(this, [0, 0, 0], models.box);
        this.lamp = new Drawable(this, [0, 0, 0], models.box);
        this.body.local_transform.yaw(90);
        this.lamp.local_transform.yaw(90);
        this.lamp.material = materials.red_led;
        this.lamp.id = this.id;
        this.body.material = materials.player;
        this.body.id = this.id;
        this.local_transform.yaw(Math.random()*360);
        this.fire = new Fire(this, [0, 0.5, 0]);
        this.collider.type = CollisionTypes.Actor;
        this.collider.radius = 0.4;
        this.name = "Drone";
        this.max_health = 50;
        this.health = 50;
        this.patrol_position = vec3.clone(this.position);
        this.target_position = this.patrol_position;
        this.tolerance = 0.1;
        this.stats = {
            movement_speed: 0.001
        };
    }
    
    toJSON(key) {
        return {
            class: 'Drone',
            local_position: this.position,
            patrol_position: this.patrol_position
        }
    }


    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        if (this.health == 0) {
            game.scene.remove(this);
            game.scene.entities.push(new FirePuff(null, this.getWorldPosition(), [0, 1, 0]));
            game.scene.entities.push(new Smoke(null, this.getWorldPosition()));
        }
    }

    update(elapsed, dirty) {
        if (this.patrol_position) {
            if (!this.velocity) {
                this.velocity = vec3.create();
            }
            this.look_at = this.target_position;
            vec3.scale(this.velocity, forward(this.getWorldTransform()), this.stats.movement_speed);
            if(vec3.dist(this.target_position, this.getWorldPosition()) < this.tolerance) {
                if (this.target_position == this.position) {
                    this.target_position = this.patrol_position;
                } else {
                    this.target_position = this.position;
                }
            }
        }
        dirty = true;
        super.update(elapsed, dirty);
        var pos = vec3.create();
        vec3.add(pos, this.getLocalPosition(), [0, Math.sin(Date.now()*0.005)*0.005, 0]);
        this.local_transform.setPosition(pos);
    }
}


classes.Drone = Drone;