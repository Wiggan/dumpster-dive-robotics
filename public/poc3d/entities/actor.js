'use strict';

class Actor extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.look_at = undefined;
        this.velocity = vec3.create();
        this.force = vec3.fromValues(0, 0, 0);
        this.stats = {
            movement_speed: 0.003,
            acceleration: 0.00005,
            jump_speed: 0.02,
            pickup_range: 1,
            attack_range: 1
        };
        this.onGround = false;
        this.groundCollider = new Collider(this, [0, 0, 0.55 ], CollisionLayer.Trigger, 0.8, 0.1);
        this.force[2] = constants.gravity;
        this.last_grounded = Date.now();
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

        dirty |= this.local_transform.isDirty();
        if (this.look_at) {
            var target_vector = vec3.create();
            vec3.sub(target_vector, this.look_at, position(this.getWorldTransform()));
            var forward_vector = forward(this.getWorldTransform());
            var angle = rad2deg(getHorizontalAngle(target_vector, forward_vector));

            if (Math.abs(angle) > 0.005) {
                var angle_increment = Math.sign(angle) * Math.min(Math.abs(angle), this.rotation_speed * elapsed);
                this.local_transform.yaw(angle_increment);
                dirty = true;
            }
        }

        if (Math.abs(this.velocity[0]) > 0.00001) {
            dirty = true;
            var movement = vec3.create();
            movement[0] = this.velocity[0]*elapsed;
            this.local_transform.translate(movement);
            mat4.copy(this.world_transform, this.local_transform.get());
            this.collider.update(0, true);
            this.collider.detectCollisions().forEach(other => {
                this.resolveX(other, movement[0]);
                mat4.copy(this.world_transform, this.local_transform.get());
                this.collider.update(0, true);
            });
        }
        if (Math.abs(this.velocity[2]) > 0.00001) {
            dirty = true;
            var movement = vec3.create();
            movement[2] = this.velocity[2]*elapsed;
            this.local_transform.translate(movement);
            mat4.copy(this.world_transform, this.local_transform.get());
            this.collider.update(0, true);
            this.collider.detectCollisions().forEach(other => {
                this.resolveY(other, movement[2]);
                mat4.copy(this.world_transform, this.local_transform.get());
                this.collider.update(0, true);
            });
        }
        super.update(elapsed, dirty);
    }

    resolveX(other, dx) {
        this.velocity[0] = 0;
        var position = this.getWorldPosition();
        if (dx < 0) {
            position[0] = other.getRight() + this.collider.half_width*1.01;
            this.local_transform.setPosition(position);
        } else {
            position[0] = other.getLeft() - this.collider.half_width*1.01;
            this.local_transform.setPosition(position);
        }
    }

    resolveY(other, dy) {
        this.velocity[2] = 0;
        var position = this.getWorldPosition();
        if (dy < 0) {
            position[2] = other.getBottom() + this.collider.half_height*1.01;
            this.local_transform.setPosition(position);
        } else {
            position[2] = other.getTop() - this.collider.half_height*1.01;
            this.local_transform.setPosition(position);
        }
    }
}
