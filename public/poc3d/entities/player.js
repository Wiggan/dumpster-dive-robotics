'use strict'

const PlayerState = {
    GotoInteractible: 'GotoInteractible',
    Goto: 'Goto',
    Idle: 'Idle',
    Attack: 'Attack',
    Firing: 'Firing'
}

class Player extends Entity {
    constructor(local_position) {
        super(null, local_position);
        this.models = {
            base: new Base(this),
            body: new Body(this),
            head: new Head(this)
        };
        this.camera = new TrackingCamera(this, [0, 8, 4]);
        this.stats = {
            movement_speed: 0.003,
            pickup_range: 1,
            attack_range: 1
        };
        this.inventory = [];
        this.equipment = {
            right_arm: undefined,
            left_arm: undefined,
        };

        this.state = PlayerState.Idle;
        this.state_context = {
            position: [local_position[0], local_position[1], local_position[2] - 1]
        };
        
        this.collider.type = CollisionTypes.Player;
        this.collider.radius = 0.5;

        this.sockets = {
            left_arm: new Entity(this.models.body, [-0.4,0.8,0]),
            right_arm: new Entity(this.models.body, [0.4,0.8,0])
        }
    }

    toJSON(key) {
        return {};
    }
    
    equip(item, socket) {
        socket.removeAllChildren();
        socket.addChild(item);
        socket.eq = item;
    }

    left_click(point, object) {
        this.models.body.look_at = point;
        if (ctrl_pressed) {
            if (this.sockets.left_arm.eq) { 
                this.models.body.lookAtInstantly(point);
                this.velocity = undefined;
                this.state = PlayerState.Idle;
                this.sockets.left_arm.eq.fire(point);
            }
        } else if (object == undefined) {
            this.velocity = vec3.create();
            this.state = PlayerState.Goto;
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
                
                this.models.body.lookAtInstantly(pos);
                this.velocity = undefined;
                this.state = PlayerState.Idle;
                this.sockets.left_arm.eq.fire(pos);
            }
        } else {
            this.velocity = vec3.create();
            this.state = PlayerState.GotoInteractible;
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
            
            this.models.body.lookAtInstantly(pos);
            this.velocity = undefined;
            this.state = PlayerState.Idle;
            this.sockets.right_arm.eq.fire(pos);
        }
    }

    update(elapsed, dirty) {
        switch (this.state) {
            case PlayerState.GotoInteractible:
                if(vec3.dist(this.state_context.position, this.getWorldPosition()) < this.state_context.tolerance) {
                    this.velocity = undefined;
                    if (this.state_context.target.type == PickableType.Enemy) {
                        this.state = PlayerState.Attack;
                    } else {
                        this.state = PlayerState.Idle;
                        this.state_context.target.interact();
                    }
                } else {
                    vec3.scale(this.velocity, forward(this.models.base.getWorldTransform()), this.stats.movement_speed);
                }
                dirty = true;
                break;
            case PlayerState.Goto:
                vec3.scale(this.velocity, forward(this.models.base.getWorldTransform()), this.stats.movement_speed);
                if(vec3.dist(this.state_context.position, this.getWorldPosition()) < this.state_context.tolerance) {
                    this.state = PlayerState.Idle;
                    this.velocity = undefined;
                }
                dirty = true;
                break;
            case PlayerState.Attack:
            case PlayerState.Firing:
                this.velocity = undefined;
                dirty = true;
                break;
        }
        super.update(elapsed, dirty);
    }

    onCollision(other) {
        super.onCollision(other);
    }
}

class BodyLamp extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.green_led;
    }
}

class HeadLamp extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.green_led;
    }
}

class Base extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.player;
    }

    update(elapsed, dirty) {
        if (this.parent.state == PlayerState.Goto || this.parent.state == PlayerState.GotoInteractible) {
            this.look_at = this.parent.state_context.position;
        } else {
            this.look_at = undefined;
        }
        super.update(elapsed, dirty);
    }
}

class Body extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.player;
        this.lamp = new BodyLamp(this);
        this.rotation_speed = 1;
    }

    update(elapsed, dirty) {
        super.update(elapsed, true);
    }
}

class Head extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.player;
        this.lamp = new HeadLamp(this);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        this.look_at = this.parent.camera.pointing_at;
    }
}

class Wrench extends Drawable {
    constructor(parent) {
        super(parent, [-0.4,0.8,0], models.box);
        this.material = materials.player;
        this.stats = {
            damage: 1,
            attack_duration: 100
        }
        this.time = 0;
    }
    
    update(elapsed, dirty) {
        if (player.state == PlayerState.Attack) {
            this.local_transform.pitch(-90/this.stats.attack_duration*elapsed);
            this.time += elapsed;
            if (this.time >= this.stats.attack_duration) {
                //player.state = PlayerState.Idle;
                this.local_transform.setPitch(0);
                this.time = 0;
            }
        }
        super.update(elapsed, dirty);
    }
}
