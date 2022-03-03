'use strict'

const items = {
    disk: {
        key: 'disk',
        name: 'Persistent Memory', 
        modifiers: {
            movement_speed: 0.002,
        },
        logs: [2, 3]
    },
    lamp: {
        key: 'lamp',
        name: 'Lamp', 
        description: 'Lamp attached to head providing light'
    },
    battery: {
        key: 'battery',
        name: 'Battery', 
        description: 'Extra battery cell providing a higher voltage for all systems', 
        modifiers: {
            movement_speed: 0.002,
            acceleration: 0.0005,
            jump_speed: 0.005,
        }
    },
    counter_pressurizer: {
        key: 'counter_pressurizer',
        name: 'Counter Pressurizer', 
        description: 'Keeps robot safe in water'
    },
    suction_device: {
        key: 'suction_device',
        name: 'Suction Device', 
        description: 'Suction device providing vertical movement'
    },
    plate: {
        key: 'plate',
        name: 'Extra Plating',
        modifiers: {
            max_health: 1,
        }
    },
    gold_nugget: {
        key: 'gold_nugget',
        name: 'Gold Nugget',
        modifiers: {
            score: 1,
        }
    }
}

const original_stats = {
    movement_speed: 0.001,
    acceleration: 0.00005,
    jump_speed: 0.013683,
    pickup_range: 1,
    attack_range: 1,
    max_health: 3,
    score: 0
};



class Player extends Actor {
    constructor(local_position) {
        super(null, local_position || [0, 0, 0]);
        this.body = new Body(this);
        this.base = new Base(this.body);
        this.head = new Head(this.body);
        this.launcher = new Launcher(this.body);
        this.launcher.instigator = this;
        this.camera = new TrackingCamera(this, [0, 3, 30]);
        this.inventory = [];
        this.slain_bosses = [];
        // Indices in the log_entries array
        this.entries = [];
        this.pickups = [];

        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Player, 0.7, 0.9);

        this.stats = JSON.parse(JSON.stringify(original_stats));
        this.dash_on_cooldown = false;
        this.jump_on_cooldown = false;
        this.dmg_on_cooldown = false;
        this.health = this.stats.max_health;
        this.blinking_drawables_on_damage = [this.body, this.head.head.drawable, this.base.base];
        
        this.onGround = false;
        this.groundCollider = new Collider(this, [0, 0, 0.55 ], CollisionLayer.Sensor, 0.7, 0.1);
        this.jumpHelperCollider = new Collider(this, [0, 0, -0.05 ], CollisionLayer.Sensor, 0.95, 0.8);
        this.force[2] = constants.gravity;
        this.last_grounded = Date.now();
        this.time_played = 0;
        window.setInterval(this.checkLogs.bind(this), 1000, 1);
    }

    toJSON(key) {
        return {
            class: 'Player'
        };
    }
    
    updateStats() {
        this.stats = JSON.parse(JSON.stringify(original_stats));
        if (this.inventory.includes(items.disk)) {
            for (const [key, value] of Object.entries(items.disk.modifiers)) {
                this.stats[key] += value;
            }
        }
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
        if (this.inventory.includes(items.lamp)) {
            if (!this.body.counter_pressurizer) {
                this.body.counter_pressurizer = new Drawable(this.body, [0, 0, -0.4], models.player.counter_pressurizer);
                this.body.counter_pressurizer.material = materials.player;
            }
        }
        if (this.inventory.includes(items.suction_device)) {
            if (!this.base.suction_device) {
                this.base.suction_device = new SuctionDevice(this.base);
            }
        }
        for (var i = 0; i < this.inventory.filter(item => item == items.plate).length; i++) {
            for (const [key, value] of Object.entries(items.plate.modifiers)) {
                this.stats[key] += value;
            }
        }
        for (var i = 0; i < this.inventory.filter(item => item == items.gold_nugget).length; i++) {
            for (const [key, value] of Object.entries(items.gold_nugget.modifiers)) {
                this.stats[key] += value;
            }
        }
    }

    pickUp(item) {
        this.inventory.push(item.item);
        switch(item.item) {
        case items.disk: 
            this.pickups.push(item.uuid);
            this.addLogEntry(2);
            window.setTimeout(() => {
                this.addLogEntry(3);
            }, 1000);
            break;
        case items.lamp: 
            this.addLogEntry(5);
            break;
        case items.battery: 
            this.addLogEntry(6);
            break;
        case items.counter_pressurizer: 
            this.addLogEntry(8);
            break;
        case items.suction_device: 
            this.addLogEntry(7);
            break;
        case items.plate: 
            this.addLogEntry(10);
            this.pickups.push(item.uuid);
            break;
        case items.gold_nugget: 
            this.addLogEntry(11);
            this.pickups.push(item.uuid);
            break;
        }
        this.updateStats();
    }

    
    checkIfGrounded() {
        var grounded = this.groundCollider.detectCollisions().filter(other => {
            return other.type == CollisionLayer.Level
        }).length != 0;

        // Save last time when actor was grounded
        if (this.onGround && !grounded) {
            this.last_grounded = Date.now();
        } else if (!this.onGround && grounded) {
            new SFX(this, [0,0,0], sfx.land);
        }
        
        return grounded;
    }


    left_click(point, object) {
        if (object && object.type == PickableType.Default && vec3.dist(object.getWorldPosition(), this.getWorldPosition()) < constants.interaction_range) {
            object.interact();
        } else if(this.inventory.includes(items.disk)) {
            this.launcher.fire();
        }
    }

    right_click(point, object) {
    }

    setJumpOnCooldown() {
        this.jump_on_cooldown = true;
        window.setTimeout(() => {
            //console.log("Jump cooldown ended!");
            this.jump_on_cooldown = false;
        }, constants.jump_cooldown);
    }

    jump() {
        if (!this.jump_on_cooldown && this.inventory.includes(items.disk)) {
            new SFX(this, [0,0,0], sfx.jump);
            // Forgiveness when jumping off edges
            if (this.onGround || Date.now() - this.last_grounded < constants.jump_forgiveness) {
                this.velocity[2] = -this.stats.jump_speed;
                this.setJumpOnCooldown();
                
                var position = [0, 0, 0.45];
                new Dirt(this, position, [0, 0, -1], 10, 0.4);
            } else if (this.base.suction_device && (this.base.suction_device.onWall || Date.now() - this.last_grounded < constants.jump_forgiveness)) {
                this.velocity[2] = -this.stats.jump_speed;
                if (this.force[0] > 0) {
                    this.velocity[0] = -this.stats.jump_speed;
                    //this.force[0] = -this.stats.acceleration;
                } else {
                    this.velocity[0] = this.stats.jump_speed;
                    //this.force[0] = this.stats.acceleration;
                }
                this.base.suction_device.onWall = false;
            }
        }
    }

    dash() {
        if (!this.dash_on_cooldown && this.inventory.includes(items.disk)) {
            //console.log("Dashing!");
            new SFX(this, [0,0,0], sfx.player_dash);
            this.dash_on_cooldown = true;
            this.stats.movement_speed *= 2;
            this.stats.acceleration *= 2;
            window.setTimeout(() => {
                //console.log("Stopped dashing!");
                this.updateStats();
            }, constants.dash_duration);
            window.setTimeout(() => {
                //console.log("Dash cooldown ended!");
                this.dash_on_cooldown = false;
            }, constants.dash_cooldown);
        }
    }

    startMovement(right) {
        var position = this.getWorldPosition();
        position[2] = 0.45;
        var direction = [-1, 0, -0.5];
        if (right) {
            // TODO play sound
            this.force[0] = this.stats.acceleration;
            position[0] = -0.4
        } else {
            this.force[0] = -this.stats.acceleration;
            direction[0] = 1;
            position[0] = 0.4
        }
        if (this.onGround) {
            new Dirt(this, position, direction, 6);
        }
    }

    startVerticalMovement(up) {}
    endVerticalMovement(up) {}

    endMovement(right) {
        this.force[0] = right ? Math.min(0, this.force[0]) : Math.max(0, this.force[0]);
        this.velocity[0] = right ? Math.min(0, this.velocity[0]) : Math.max(0, this.velocity[0]);
    }

    addLogEntry(index) {
        this.entries.push(index);
        if (this.entries.length > 47) {
            this.entries.shift();
        }
        new SFX(player, [0, 0, 0], sfx.log_entry);
        var toggle = false;
        var interval = window.setInterval(() => {
            toggle = !toggle;
            line_alpha = toggle ? 1.0 : 0.1;
        },100);
        window.setTimeout(() => {
            window.clearInterval(interval);
            line_alpha = 0.1;
        }, 1000);
    }

    checkLogs(elapsed_s) {
        this.time_played += elapsed_s;
        if (this.time_played > 1 && !this.entries.includes(0)) {
            this.addLogEntry(0);
        }
        if (this.time_played > 3 && !this.entries.includes(1)) {
            this.addLogEntry(1);
        }
        if (this.time_played > 10 && !this.hint && player.inventory.includes(items.disk) && !player.inventory.includes(items.lamp) && game.scene.name == 'Downfall') {
            this.addLogEntry(4);
            this.hint = game.scene.getAllOfClass('Portal').filter(portal => portal.getDestinationPortal().scene.name == 'LampBossRoom')[0].getWorldPosition();
        }
        if (this.time_played > 11 && !this.hint && player.inventory.includes(items.lamp) && !player.inventory.includes(items.battery) && game.scene.name == 'Downfall') {
            this.addLogEntry(4);
            this.hint = game.scene.getAllOfClass('Portal').filter(portal => portal.getDestinationPortal().scene.name == 'BatteryBossRoom')[0].getWorldPosition();
        }
        if (this.time_played > 12 && !this.hint && player.inventory.includes(items.battery) && !player.inventory.includes(items.counter_pressurizer) && game.scene.name == 'Downfall') {
            this.addLogEntry(4);
            this.hint = game.scene.getAllOfClass('Portal').filter(portal => portal.getDestinationPortal().scene.name == 'PressurizerBossRoom')[0].getWorldPosition();
        }
        if (this.time_played > 13 && !this.hint && player.inventory.includes(items.counter_pressurizer) && !player.inventory.includes(items.suction_device) && game.scene.name == 'Downfall') {
            this.addLogEntry(4);
            this.hint = game.scene.getAllOfClass('Portal').filter(portal => portal.getDestinationPortal().scene.name == 'PoolBossRoom')[0].getWorldPosition();
        }
    }

    update(elapsed, dirty) {
        // Stop if no force is applied
        if (Math.abs(this.force[0]) < 0.00001) {
            this.velocity[0] = 0;
        }
        if (Math.abs(this.force[2]) < 0.00001) {
            this.velocity[0] = 0;
        }

        if (!this.base.suction_device || !this.base.suction_device.onWall) {
            this.force[2] = constants.gravity;
        } else {
            if (this.up) {
                this.force[2] = -this.stats.acceleration;
            } else if (this.down) {
                this.force[2] = this.stats.acceleration;
            } 
        }
        this.onGround = this.checkIfGrounded();

        // Accelerate
        var at = vec3.create();
        vec3.scale(at, this.force, elapsed);
        vec3.add(this.velocity, this.velocity, at);

        // Help with jumping
        if (!this.onGround) {
            var jump_collisions = this.jumpHelperCollider.detectCollisions();
            var block_above = undefined;
            var block_above_left = undefined;
            var block_above_right = undefined;
            var block_left = undefined;
            var block_right = undefined;
            var player_position = snapToGrid(this.getWorldPosition());
            jump_collisions.forEach(collider => {
                if (collider.getMidX() == player_position[0] && collider.getMidY() == player_position[2]-1) {
                    block_above = collider;
                }
                if (collider.getMidX() == player_position[0]-1 && collider.getMidY() == player_position[2]-1) {
                    block_above_left = collider;
                }
                if (collider.getMidX() == player_position[0]+1 && collider.getMidY() == player_position[2]-1) {
                    block_above_right = collider;
                }
                if (collider.getMidX() == player_position[0]-1 && collider.getMidY() == player_position[2]) {
                    block_left = collider;
                }
                if (collider.getMidX() == player_position[0]+1 && collider.getMidY() == player_position[2]) {
                    block_right = collider;
                }
            });
            if (!block_above) {
                if (block_above_left && !block_left && this.collider.getTop() < block_above_left.getBottom()) {
                    this.velocity[0] += constants.jump_help_strength*elapsed;
                } else if (block_above_right && !block_right  && this.collider.getTop() < block_above_right.getBottom()) {
                    this.velocity[0] -= constants.jump_help_strength*elapsed;
                }
                //console.log("Jump help:" + (block_left ? "Block left! " : "") + (block_above_left ? "Block above left! " : "") + (block_above ? "Block above! " : "") + (block_above_right ? "Block above right! " : "") + (block_right ? "Block right! " : ""));
            }
        }

        // Limit velocities
        this.velocity[0] = Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[0]));
        if (!this.base.suction_device || !this.base.suction_device.onWall) {
            this.velocity[2] = Math.min(this.stats.jump_speed, Math.max(-this.stats.jump_speed, this.velocity[2]));
        } else {
            this.velocity[2] = Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[2]));
        }
        
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
            new SFX(this, [0, 0, 0], sfx.take_damage);
            super.takeDamage(amount, instigator, collider);
            if (collider.type == CollisionLayer.Enemy) {
                if (this.getWorldPosition()[0] < instigator.getWorldPosition()[0]) {
                    this.velocity = [-0.004, 0, -0.02];
                } else {
                    this.velocity = [0.004, 0, -0.02];
                }
            }
        }
    }

    onDeath() {
        game.transition = new Transition(game, [
            {
                time: 2000,
                to: { overlay: [0.0, 0.0, 0.0, 1.0]},
                callback: () => {
                    showStartScreen();
                    
                }
            }
        ]);
        super.onDeath();
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

class Base extends DynamicEntity {
    constructor(parent) {
        super(parent, [0,0,-0.335]);
        this.frame_helper = 0;
        this.frame_scaler = 1500;
        this.frame_index = 0;
        this.tracks = new Drawable(this, [0,0,0], models.player.base.track_frames[this.frame_index]);
        this.base = new Drawable(this, [0,0,0], models.player.base.base_frames[this.frame_index]);
        this.tracks.material = materials.rubber;
        this.base.material = materials.player;
        this.rotation_speed = 0.7;
        
        this.dash_led = new Drawable(this, [0.1, 0, 0.135], models.box);
        this.dash_led.material = materials.green_led;
        this.dash_led.local_transform.scale([0.015, 0.28, 0.015]);
        this.jump_led = new Drawable(this, [-0.1, 0, 0.135], models.box);
        this.jump_led.material = materials.green_led;
        this.jump_led.local_transform.scale([0.015, 0.28, 0.015]);
    }

    update(elapsed, dirty) {
        // Animate
        const frames = models.player.base.base_frames.length;
        this.frame_helper -= player.force[0] * elapsed;
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

class SuctionDevice extends Drawable {
    constructor(parent) {
        super(parent, [0, 0, 0], models.player.suction_device);
        this.material = materials.rubber;
        player.rightCollider = new Collider(player, [0.01, 0, 0.15], CollisionLayer.Sensor, 0.7, 0.6);
        player.leftCollider = new Collider(player, [-0.01, 0, 0.15], CollisionLayer.Sensor, 0.7, 0.6);
        player.up = false;
        player.down = false;

        player.startVerticalMovement = function(up) {
            if (up) {
                this.up = true;
            } else {
                this.down = true;
            }
        }

        player.endVerticalMovement = function(up) {
            if (this.base.suction_device.onWall) {
                this.force[2] = up ? Math.max(0, this.force[2]) : Math.min(0, this.force[2]);
                this.velocity[2] = up ? Math.max(0, this.velocity[2]) : Math.min(0, this.velocity[2]);
            }
            if (up) {
                this.up = false;
            } else {
                this.down = false
            }
        }
        this.onWall = false;
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        //console.log("OnWall: " + this.onWall + ", Force: " + player.force[0] + ", Right collisions: " +player.rightCollider.detectCollisions().length + ", Left collisions: " +player.leftCollider.detectCollisions().length)
        if (player.force[0] > 0.00001 && player.rightCollider.detectCollisions().length > 0) {
            var direction = player.base.getWorldPosition();
            vec3.add(direction, direction, [0.1, 0, -1]);
            player.base.look_at = direction;
            if (!this.onWall) {
                player.force[2] = 0;
                player.velocity[2] = 0;
            }
            this.onWall = true;
            player.last_grounded = Date.now();
        } else if (player.force[0] < -0.00001 && player.leftCollider.detectCollisions().length > 0) { 
            var direction = player.base.getWorldPosition();
            vec3.add(direction, direction, [0.1, 0, 1]);
            player.base.look_at = direction;
            if (!this.onWall) {
                player.force[2] = 0;
                player.velocity[2] = 0;
            }
            this.onWall = true;
            player.last_grounded = Date.now();
        } else {
            var direction = player.base.getWorldPosition();
            vec3.add(direction, direction, [1, 0, 0]);
            player.base.look_at = direction;
            this.onWall = false;
        }
    }

/*     draw(renderer) {
        super.draw(renderer);
        debug=true;
        player.rightCollider.draw(renderer);
        player.leftCollider.draw(renderer);
        debug=false;
    } */
}

class Body extends Drawable {
    constructor(parent) {
        super(parent, [0, 0, 0.450], models.player.body);
        this.material = materials.player;
        //this.lamp = new BodyLamp(this);
        this.rotation_speed = 1;
    }
}

class LifeLED extends Drawable {
    constructor(parent, local_position, index) {
        super(parent, local_position, models.box);
        this.local_transform.scale([0.01, 0.05, 0.04]);
        this.index = index;
        this.visible = false;
    }

    update(elapsed, dirty) {
        if (player.stats.max_health > this.index) {
            this.visible = true;
        }
        if (player.health > this.index) {
            this.material =  materials.green_led;
        } else {
            this.material =  materials.red_led;
        }
        super.update(elapsed, dirty);
    }

    draw(renderer) {
        if (this.visible) {
            super.draw(renderer);
        }
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
        this.lifeLeds = [];
        for(var i = 0; i < 6; i++) {
            this.lifeLeds.push(new LifeLED(this.head, [i * 0.02 - 0.06, 0.15, 0], i));
        }
    }

    update(elapsed, dirty) {
        if (player.hint) {
            this.head.look_at = player.hint;
        } else {
            this.head.look_at = player.camera.pointing_at;
        }
        super.update(elapsed, dirty);
    }
}

