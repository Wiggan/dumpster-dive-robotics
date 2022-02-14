'use strict'

const items = {
    lamp: {
        name: 'Lamp', 
        description: 'Lamp attached to head'
    },
    battery: {
        name: 'Battery', 
        description: 'Extra battery cell providing a higher voltage for all systems', 
        modifiers: {
            movement_speed: 0.002,
            acceleration: 0.0005,
            jump_speed: 0.01,
        }
    },
}

const original_stats = {
    movement_speed: 0.003,
    acceleration: 0.00005,
    jump_speed: 0.013683,
    pickup_range: 1,
    attack_range: 1
};

class Player extends Actor {
    constructor(local_position) {
        super(null, local_position);
        this.base = new Base(this);
        this.body = new Body(this);
        this.head = new Head(this);
        this.camera = new TrackingCamera(this, [0, 8, 0]);
        this.inventory = [];

        this.state_context = {
            position: [local_position[0], local_position[1], local_position[2] - 1]
        };
        
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Player, 0.9, 0.9);

        this.sockets = {
            left_arm: new Entity(this.body, [-0.4,0.8,0]),
            right_arm: new Entity(this.body, [0.4,0.8,0])
        }
        this.groundCollider.type = CollisionLayer.Player;
        this.stats = JSON.parse(JSON.stringify(original_stats));
        this.last_right = 0;
        this.last_left = 0;
        this.dash_on_cooldown = false;
        this.jump_on_cooldown = false;
    }

    toJSON(key) {
        return {
            class: 'Player'
        };
    }
    
    updateStats() {
        this.stats = JSON.parse(JSON.stringify(original_stats));
        if (this.inventory.includes(items.lamp)) {
            if (!this.head.lamp) {
                this.head.lamp = new HeadLamp(this.head, [0, 0, -0.4], game.scene);
            }
        }
        if (this.inventory.includes(items.battery)) {
            for (const [key, value] of Object.entries(items.battery.modifiers)) {
                this.stats[key] += value;
            }
        }
    }

    pickUp(item) {
        this.inventory.push(item);
        this.updateStats();
    }

    left_click(point, object) {
        this.body.look_at = point;
        if (ctrl_pressed) {
            if (this.sockets.left_arm.eq) { 
                this.body.lookAtInstantly(point);
                this.velocity = undefined;
                this.sockets.left_arm.eq.fire(point);
            }
        } else if (object == undefined) {
            this.velocity = vec3.create();
            this.state_context = {
                position: point,
                tolerance: 0.1
            };
        } else if (object.type == PickableType.Enemy) {
            if (this.sockets.left_arm.eq) {
                var pos = point;
                if (object) {
                    pos = object.getWorldPosition();
                }
                
                this.body.lookAtInstantly(pos);
                this.velocity = undefined;
                this.sockets.left_arm.eq.fire(pos);
            }
        } else {
            this.velocity = vec3.create();
            this.state_context = {
                target: object,
                position: object.getWorldPosition(),
                tolerance: this.stats.pickup_range
            };
        }
    }

    right_click(point, object) {
        if (this.sockets.right_arm.eq) {
            var pos = point;
            if (object) {
                pos = object.getWorldPosition();
            }
            
            this.body.lookAtInstantly(pos);
            this.velocity = undefined;
            this.sockets.right_arm.eq.fire(pos);
        }
    }

    jump() {
        // Forgiveness when jumping of edges
        if (!this.jump_on_cooldown && (this.onGround || Date.now() - this.last_grounded < constants.jump_forgiveness)) {
            this.velocity[2] = -this.stats.jump_speed;
            this.jump_on_cooldown = true;
            window.setTimeout(() => {
                console.log("Jump cooldown ended!");
                this.jump_on_cooldown = false;
            }, constants.jump_cooldown);
        }
    }

    dash() {
        if (!this.dash_on_cooldown) {
            console.log("Dashing!");
            // TODO play sound
            this.dash_on_cooldown = true;
            this.stats.movement_speed *= 2;
            this.stats.acceleration *= 2;
            window.setTimeout(() => {
                console.log("Stopped dashing!");
                this.updateStats();
            }, constants.dash_duration);
            window.setTimeout(() => {
                console.log("Dash cooldown ended!");
                this.dash_on_cooldown = false;
            }, constants.dash_cooldown);
        }
    }

    startMovement(right) {
        if (right) {
            if (Date.now() - this.last_right < constants.dash_timing) {
                this.dash();
            }
            // TODO play sound
            this.force[0] = this.stats.acceleration;
            this.last_right = Date.now();
        } else {
            if (Date.now() - this.last_left < constants.dash_timing) {
                this.dash();
            }
            this.force[0] = -this.stats.acceleration;
            this.last_left = Date.now();
        }
    }

    endMovement(right) {
        this.force[0] = right ? Math.min(0, this.force[0]) : Math.max(0, this.force[0]);
        this.velocity[0] = right ? Math.min(0, this.velocity[0]) : Math.max(0, this.velocity[0]);
    }
}

class BodyLamp extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.green_led;
        this.local_transform.scale([0.1, 0.1, 0.1]);
    }
}

class HeadLamp extends PointLight {
    constructor(parent, local_position, scene) {
        super(parent, local_position, scene);
        this.constant = LanternLight.Constant;
        this.linear = LanternLight.Linear;
        this.quadratic = LanternLight.Quadratic;
        this.prism = new Drawable(this, [0, 0, 0], models.box);
        this.prism.material = materials.light;
        //this.prism.local_transform.scaleUniform(0.3);
        this.active = true;
    }
}

class Base extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.player;
        this.local_transform.scale([0.8, 0.2, 0.2]);
    }


    // TODO lampor som indikerar cooldown på hopp och dash
/*     update(elapsed, dirty) {
        if (this.parent.state == PlayerState.Goto || this.parent.state == PlayerState.GotoInteractible) {
            this.look_at = this.parent.state_context.position;
        } else {
            this.look_at = undefined;
        }
        super.update(elapsed, dirty);
    } */
}

class Body extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.player;
        this.lamp = new BodyLamp(this);
        this.rotation_speed = 1;
        this.local_transform.scale([0.6, 0.6, 0.9]);
    }
}

class Head extends Drawable {
    constructor(parent) {
        super(parent, [0,0,-0.6], models.box);
        this.material = materials.player;
        this.lamp = undefined; //new HeadLamp(this);
        this.local_transform.scale([0.3, 0.3, 0.3]);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        this.look_at = this.parent.camera.pointing_at;
    }
}

