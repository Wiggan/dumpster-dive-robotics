'use strict'

class PatrolStrategy {
    constructor(parent) {
        this.parent = parent;
        this.patrol_points = [];
        this.target_position = this.patrol_position;
        this.index = 0;
        this.position_index = 0;
    }

    toJSON(key) {
        return {
            class: 'PatrolStrategy',
            patrol_points: this.patrol_points
        }
    }

    getPositionIndex(index) {
        const max = this.patrol_points.length - 1;
        if (max > 0) {
            return (Math.floor(index/max) % 2 == 0) ? index%max : max - index%max;
        } 
        return 0;
    }

    update(elapsed) {
        if (this.patrol_points.length > 0) {
            var dist = vec3.dist(this.patrol_points[this.position_index], this.parent.getWorldPosition());
            if(dist < this.parent.stats.patrol_tolerance) {
                this.index++;
                this.position_index = this.getPositionIndex(this.index);
                this.parent.look_at = this.patrol_points[this.position_index];

            }
            var direction = vec3.create();
            vec3.subtract(direction, this.patrol_points[this.position_index], this.parent.getWorldPosition());
            vec3.normalize(direction, direction);
            vec3.scale(this.parent.velocity, direction, this.parent.stats.movement_speed);
        }
    }

}

classes.PatrolStrategy = PatrolStrategy;