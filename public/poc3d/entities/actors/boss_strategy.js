'use strict'

const BossStates = {
    Patrol: 'Patrol',
    Wait: 'Wait',
    Attack: 'Attack'
};

class BossStrategy {
    constructor(parent) {
        this.parent = parent;
        this.patrol_points = [];
        this.position_index = 0;
        this.state;

    }

    toJSON(key) {
        return {
            class: 'BossStrategy',
            patrol_points: this.patrol_points
        }
    }

    pickNewState() {
        if (Math.random() < 0.3) {
            this.state = BossStates.Wait;
            window.setTimeout(() => this.pickNewState(), 500 + Math.random() * 1000);
        } else if (Math.random() < 0.5) {
            this.state = BossStates.Patrol;
            this.position_index = Math.floor(this.patrol_points.length * Math.random());
            this.parent.look_at =  this.patrol_points[this.position_index];
        } else {
            this.state = BossStates.Attack;
            this.attack_position = player.getWorldPosition();
            this.parent.look_at = this.attack_position;
        }
        console.log(this.state);
    }

    update(elapsed) {
        if (!this.state) {
            this.pickNewState();
        } else if (this.state == BossStates.Patrol) {
            if (this.patrol_points.length > 0) {
                var dist = vec3.dist(this.patrol_points[this.position_index], this.parent.getWorldPosition());
                if(dist < patrol_tolerance) {
                    this.pickNewState();
                }
                var direction = vec3.create();
                vec3.subtract(direction, this.patrol_points[this.position_index], this.parent.getWorldPosition());
                vec3.normalize(direction, direction);
                vec3.scale(this.parent.velocity, direction, this.parent.stats.movement_speed);
            }
        } else if (this.state == BossStates.Attack) {
            var dist = vec3.dist(this.attack_position, this.parent.getWorldPosition());
            if(dist < patrol_tolerance) {
                this.pickNewState();
            }
            var direction = vec3.create();
            vec3.subtract(direction, this.attack_position, this.parent.getWorldPosition());
            vec3.normalize(direction, direction);
            vec3.scale(this.parent.velocity, direction, this.parent.stats.movement_speed);
            
        }
    }

}

classes.BossStrategy = BossStrategy;