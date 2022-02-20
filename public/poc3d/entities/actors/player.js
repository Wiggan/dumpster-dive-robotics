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
            jump_speed: 0.005,
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
        this.body = new Body(this);
        this.base = new Base(this.body);
        this.head = new Head(this.body);
        this.launcher = new Launcher(this.body);
        this.launcher.instigator = this;
        this.camera = new TrackingCamera(this, [0, 3, 30]);
        this.inventory = [];

        this.state_context = {
            position: [local_position[0], local_position[1], local_position[2] - 1]
        };
        
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Player, 0.7, 0.9);

        this.stats = JSON.parse(JSON.stringify(original_stats));
        this.last_right = 0;
        this.last_left = 0;
        this.dash_on_cooldown = false;
        this.jump_on_cooldown = false;
        this.dmg_on_cooldown = false;
        this.max_health = 3;
        this.health = 3;
        
        this.onGround = false;
        this.groundCollider = new Collider(this, [0, 0, 0.55 ], CollisionLayer.Player, 0.8, 0.1);
        this.force[2] = constants.gravity;
        this.last_grounded = Date.now();
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
                this.head.lamp = new HeadLamp(this.head, [0, 0, 0], game.scene);
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

    
    checkIfGrounded() {
        var grounded = this.groundCollider.detectCollisions().filter(other => {
            return other.type == CollisionLayer.Level
        }).length != 0;

        // Save last time when actor was grounded
        if (this.onGround && !grounded) {
            this.last_grounded = Date.now();
        }
        return grounded;
    }


    left_click(point, object) {
        if (object && object.type == PickableType.Default && vec3.dist(object.getWorldPosition(), this.getWorldPosition()) < constants.interaction_range) {
            object.interact();
        } else {
            this.launcher.fire();
        }
    }

    right_click(point, object) {
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
            new SFX(this, [0,0,0], sfx.player_dash);
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

    update(elapsed, dirty) {
                
        this.force[2] = constants.gravity;
        this.onGround = this.checkIfGrounded();

        // Accelerate
        var at = vec3.create();
        vec3.scale(at, this.force, elapsed);
        vec3.add(this.velocity, this.velocity, at);

        // Limit velocities
        this.velocity[0] = Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[0]));
        this.velocity[2] = Math.min(this.stats.jump_speed, Math.max(-this.stats.jump_speed, this.velocity[2]));
        
        
        // Update direction based on pointer
        if (this.camera.pointing_at[0] < this.getWorldPosition()[0]) {
            this.launcher.local_transform.setRoll(180);
        } else {
            this.launcher.local_transform.setRoll(0);
        }

        super.update(elapsed, dirty);
        if (Math.abs(this.velocity[0]) < 0.001) {
            if (this.moving_sound) {
                this.moving_sound.stop();
                this.moving_sound = undefined;
            }
        } else {
            if (!this.moving_sound) this.moving_sound = new SFX(this, [0, 0, 0], sfx.player_moving);
        }
        if (this.moving_sound) {
            this.moving_sound.setRate(Math.abs(this.velocity[0])/original_stats.movement_speed);
        }
    }

    takeDamage(amount, instigator, collider) {
        if (!this.dmg_on_cooldown) {
            super.takeDamage(amount, instigator);
            if (collider.type == CollisionLayer.Enemy) {
                if (this.getWorldPosition()[0] < instigator.getWorldPosition()[0]) {
                    this.velocity = [-0.004, 0, -0.02];
                } else {
                    this.velocity = [0.004, 0, -0.02];
                }
            }
            this.dmg_on_cooldown = true;
            this.body.material = materials.red_led;
            this.head.head.drawable.material = materials.red_led;
            this.base.base.material = materials.red_led;
            window.setTimeout(() => {
                this.dmg_on_cooldown = false;
                this.body.material = materials.player;
                this.head.head.drawable.material = materials.player;
                this.base.base.material = materials.player;
            }, constants.dmg_cooldown);
        }
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
        this.prism = new Drawable(this, [0, 0, 0], models.player.head_lamp);
        this.prism.material = materials.light;
        this.active = true;
    }
}

class Base extends Entity {
    constructor(parent) {
        super(parent, [0,0,0]);
        this.frame_helper = 0;
        this.frame_scaler = 20;
        this.frame_index = 0;
        this.tracks = new Drawable(this, [0,0,0], models.player.base.track_frames[this.frame_index]);
        this.base = new Drawable(this, [0,0,0], models.player.base.base_frames[this.frame_index]);
        this.tracks.material = materials.rubber;
        this.base.material = materials.player;
        
        this.dash_led = new Drawable(this, [0.1, 0, -0.20], models.box);
        this.dash_led.material = materials.green_led;
        this.dash_led.local_transform.scale([0.015, 0.28, 0.015]);
        this.jump_led = new Drawable(this, [-0.1, 0, -0.20], models.box);
        this.jump_led.material = materials.green_led;
        this.jump_led.local_transform.scale([0.015, 0.28, 0.015]);
    }


    // TODO lampor som indikerar cooldown på hopp och dash
    update(elapsed, dirty) {
        // Animate
        const frames = models.player.base.base_frames.length;
        this.frame_helper -= player.velocity[0] * elapsed;
        this.frame_index = Math.floor((this.frame_helper * this.frame_scaler) % frames);
        if (this.frame_index < 0) this.frame_index += frames;
        //console.log(this.frame_index);
        this.tracks.model = models.player.base.track_frames[this.frame_index];
        this.base.model = models.player.base.base_frames[this.frame_index];

        // Update leds
        if (player.dash_on_cooldown) {
            this.dash_led.material = materials.red_led;
        } else {
            this.dash_led.material = materials.green_led;
        }
        if (player.jump_on_cooldown) {
            this.jump_led.material = materials.red_led;
        } else {
            this.jump_led.material = materials.green_led;
        }

        super.update(elapsed, dirty);
    }
}

class Body extends Drawable {
    constructor(parent) {
        super(parent, [0, 0, 0.328], models.player.body);
        this.material = materials.player;
        //this.lamp = new BodyLamp(this);
        this.rotation_speed = 1;
    }
}

class Head extends DynamicEntity {
    constructor(parent) {
        super(parent, [0,0,0]);
        this.head_holder = new Drawable(this, [0,0,0], models.player.head_holder);
        this.head_holder.material = materials.player;
        this.head = new DynamicEntity(this, [0, 0, -0.689898]);
        this.head.rotation_speed = 0.2;
        this.head.drawable = new Drawable(this.head, [0,0,0], models.player.head);
        this.head.drawable.material = materials.player;
        this.lamp = undefined; //new HeadLamp(this);
    }

    update(elapsed, dirty) {
        this.head.look_at = player.camera.pointing_at;
        super.update(elapsed, dirty);
    }
}

