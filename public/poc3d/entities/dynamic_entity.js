'use strict';

class DynamicEntity extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.look_at = undefined;
        this.velocity = vec3.create();
    }

    update(elapsed, dirty) {
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
        var movement = vec3.create();
        vec3.scale(movement, this.velocity, elapsed);
        this.local_transform.translate(movement);
        this.last_movement = movement;
        super.update(elapsed, dirty);
    }

    resolveElastic(entity) {
        // Find the mid points of the entity and player
        var pMidX = this.collider.getMidX();
        var pMidY = this.collider.getMidY();
        var aMidX = entity.collider.getMidX();
        var aMidY = entity.collider.getMidY();
    
        // To find the side of entry calculate based on
        // the normalized sides
        var dx = (aMidX - pMidX) / entity.collider.half_width;
        var dy = (aMidY - pMidY) / entity.collider.half_height;
    
        // Calculate the absolute change in x and y
        var absDX = abs(dx);
        var absDY = abs(dy);
    
        // If the distance between the normalized x and y
        // position is less than a small threshold (.1 in this case)
        // then this object is approaching from a corner
        if (abs(absDX - absDY) < .1) {
    
            // If the player is approaching from positive X
            if (dx < 0) {
    
                // Set the player x to the right side
                this.collider.x = entity.collider.getRight();
    
            // If the player is approaching from negative X
            } else {
    
                // Set the player x to the left side
                this.collider.x = entity.collider.getLeft() - this.collider.width;
            }
    
            // If the player is approaching from positive Y
            if (dy < 0) {
    
                // Set the player y to the bottom
                this.collider.y = entity.collider.getBottom();
    
            // If the player is approaching from negative Y
            } else {
    
                // Set the player y to the top
                this.collider.y = entity.collider.getTop() - this.collider.height;
            }
    
            // Randomly select a x/y direction to reflect velocity on
            if (Math.random() < .5) {
    
                // Reflect the velocity at a reduced rate
                this.collider.vx = -this.collider.vx * entity.restitution;
    
                // If the object's velocity is nearing 0, set it to 0
                // STICKY_THRESHOLD is set to .0004
                if (abs(this.collider.vx) < STICKY_THRESHOLD) {
                    this.collider.vx = 0;
                }
            } else {
    
                this.collider.vy = -this.collider.vy * entity.restitution;
                if (abs(this.collider.vy) < STICKY_THRESHOLD) {
                    this.collider.vy = 0;
                }
            }
    
        // If the object is approaching from the sides
        } else if (absDX > absDY) {
    
            // If the player is approaching from positive X
            if (dx < 0) {
                this.collider.x = entity.getRight();
    
            } else {
            // If the player is approaching from negative X
            this.collider.x = entity.getLeft() - this.collider.width;
            }
    
            // Velocity component
            this.collider.vx = -this.collider.vx * entity.restitution;
    
            if (abs(this.collider.vx) < STICKY_THRESHOLD) {
                this.collider.vx = 0;
            }
    
        // If this collision is coming from the top or bottom more
        } else {
    
            // If the player is approaching from positive Y
            if (dy < 0) {
                this.collider.y = entity.getBottom();
    
            } else {
            // If the player is approaching from negative Y
            this.collider.y = entity.getTop() - this.collider.height;
            }
    
            // Velocity component
            this.collider.vy = -this.collider.vy * entity.restitution;
            if (abs(this.collider.vy) < STICKY_THRESHOLD) {
                this.collider.vy = 0;
            }
        }
    };
    
}
