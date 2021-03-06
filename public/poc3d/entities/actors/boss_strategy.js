'use strict'

const BossStates = {
    Patrol: 'Patrol',
    Wait: 'Wait',
    Attack: 'Attack'
};

class BossStrategy {
    constructor(parent, probabilities) {
        this.parent = parent;
        this.probabilities = probabilities || [0.3, 0.5];
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
        if (Math.random() < this.probabilities[0]) {
            this.state = BossStates.Wait;
            window.setTimeout(() => this.pickNewState(), 500 + Math.random() * 1000);
        } else if (Math.random() < this.probabilities[1]) {
            this.state = BossStates.Patrol;
            this.position_index = Math.floor(this.patrol_points.length * Math.random());
            this.parent.look_at =  this.patrol_points[this.position_index];
            this.parent.goto(this.patrol_points[this.position_index]);
        } else {
            if (player) {
                this.state = BossStates.Attack;
                this.attack_position = snapToGrid(player.getWorldPosition());
                this.parent.look_at = this.attack_position;
                this.parent.attack(this.attack_position);
            }
        }
        console.log(this.state);
    }

    update(elapsed) {
        if (!this.state && player && !game.paused) {
            this.pickNewState();
        } else if (this.state == BossStates.Patrol) {
            if (this.patrol_points.length > 0) {
                var dist = vec3.dist(this.patrol_points[this.position_index], this.parent.getWorldPosition());
                if(dist < this.parent.stats.patrol_tolerance) {
                    this.state = BossStates.Wait;
                    window.setTimeout(() => this.pickNewState(), 500);
                }
            }
        } else if (this.state == BossStates.Attack) {
            if (this.parent.attack_done) {
                this.pickNewState();
            }
        }
    }

}

classes.BossStrategy = BossStrategy;