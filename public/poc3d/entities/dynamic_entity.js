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
}
