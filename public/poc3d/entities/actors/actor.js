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
        this.max_health = 2;
        this.health = 2;
    }


    update(elapsed, dirty) {
        dirty |= this.local_transform.isDirty();

        const indices = [0, 2];
        indices.forEach(i => {
            if (Math.abs(this.velocity[i]) > 0.00001) {
                dirty = true;
                var movement = vec3.create();
                movement[i] = this.velocity[i]*elapsed;
                this.local_transform.translate(movement);
                mat4.copy(this.world_transform, this.local_transform.get());
                this.collider.update(0, true);
                this.collider.detectCollisions().forEach(other => {
                    // Todo handle enemy collision...
                    if (other.type == CollisionLayer.Level) {
                        if (i == 0) {
                            this.resolveX(other, movement[i]);
                        } else {
                            this.resolveY(other, movement[i]);
                        }
                        mat4.copy(this.world_transform, this.local_transform.get());
                        this.collider.update(0, true);
                    } else if (other.type == CollisionLayer.Trigger) {
                        other.parent.onCollision(this);
                    } else if (other.type == CollisionLayer.Enemy) {
                        if (this.collider.type == CollisionLayer.Player) {
                            this.takeDamage(other.parent.stats.dmg, other.parent, this.collider)
                        }
                    }
                });
            }

        });
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

    onDeath() {
        game.scene.remove(this);
        game.scene.colliders.splice(game.scene.colliders.lastIndexOf(this.collider), 1);
        
        game.scene.entities.push(new FirePuff(null, this.getWorldPosition(), [0, 0, 1]));
        game.scene.entities.push(new Smoke(null, this.getWorldPosition(), [0, 0, 1]));
    }
    
    takeDamage(amount, instigator, collider) {
        this.health = Math.max(0, this.health - amount);
        if (this.health == 0) {
            this.onDeath();
        }
    }
}
