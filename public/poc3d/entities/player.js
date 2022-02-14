'use strict'

const PlayerState = {
    GotoInteractible: 'GotoInteractible',
    Goto: 'Goto',
    Idle: 'Idle',
    Attack: 'Attack',
    Firing: 'Firing'
}

class Player extends Actor {
    constructor(local_position) {
        super(null, local_position);
        this.base = new Base(this);
        this.body = new Body(this);
        this.head = new Head(this);
        this.camera = new TrackingCamera(this, [0, 8, 0]);
        this.inventory = [];
        this.equipment = {
            right_arm: undefined,
            left_arm: undefined,
        };

        this.state = PlayerState.Idle;
        this.state_context = {
            position: [local_position[0], local_position[1], local_position[2] - 1]
        };
        
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Player, 0.9, 0.9);

        this.sockets = {
            left_arm: new Entity(this.body, [-0.4,0.8,0]),
            right_arm: new Entity(this.body, [0.4,0.8,0])
        }
        this.groundCollider.type = CollisionLayer.Player;
    }

    toJSON(key) {
        return {
            class: 'Player'
        };
    }
    
    equip(item, socket) {
        socket.removeAllChildren();
        socket.addChild(item);
        socket.eq = item;
    }

    left_click(point, object) {
        this.body.look_at = point;
        if (ctrl_pressed) {
            if (this.sockets.left_arm.eq) { 
                this.body.lookAtInstantly(point);
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
                
                this.body.lookAtInstantly(pos);
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
            
            this.body.lookAtInstantly(pos);
            this.velocity = undefined;
            this.state = PlayerState.Idle;
            this.sockets.right_arm.eq.fire(pos);
        }
    }

    jump() {
        if (this.onGround) {
            this.velocity[2] = -this.stats.jump_speed;
        }
    }

    startMovement(right) {
        this.force[0] = right ? this.stats.acceleration : -this.stats.acceleration;
    }

    endMovement() {
        this.force[0] = 0;
        this.velocity[0] = 0;
    }
}

class BodyLamp extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.green_led;
        this.local_transform.scale([0.1, 0.1, 0.1]);
    }
}

class HeadLamp extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.green_led;
        this.local_transform.scale([0.1, 0.1, 0.1]);
    }
}

class Base extends Drawable {
    constructor(parent) {
        super(parent, [0,0,0], models.box);
        this.material = materials.player;
        this.local_transform.scale([0.8, 0.2, 0.2]);
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
        this.local_transform.scale([0.6, 0.6, 0.9]);
    }
}

class Head extends Drawable {
    constructor(parent) {
        super(parent, [0,0,-0.6], models.box);
        this.material = materials.player;
        this.lamp = new HeadLamp(this);
        this.local_transform.scale([0.3, 0.3, 0.3]);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        this.look_at = this.parent.camera.pointing_at;
    }
}

