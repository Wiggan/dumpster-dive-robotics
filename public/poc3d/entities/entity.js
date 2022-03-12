'use strict';

class Entity {
    constructor(parent, local_position) {
        this.parent = parent;
        this.children = [];
        this.collider = undefined;
        this.local_transform = new Transform(local_position);
        this.world_transform = mat4.clone(this.local_transform.get());
        if (this.parent) {
            mat4.mul(this.world_transform, this.parent.world_transform, this.local_transform.get());
            this.parent.children.push(this);
            this.id = parent.id;
        }
        this.look_at = undefined;
        this.rotation_speed = 0.5;
        this.velocity = [0,0,0];
        this.independent = false;
        this.uuid = uuid();
    }

    // Called after construction for another pass, where neighbors are known
    init(scene) {}

    addChild(child) {
        child.parent = this;
        this.children.push(child);
    }

    removeChild(child) {
        if (this.children.includes(child)) {
            this.children.splice(this.children.lastIndexOf(child), 1);
            child.parent = undefined;
        }
    }

    removeAllChildren() {
        this.children.forEach(child => child.parent = undefined);
        this.children.length = 0;
    }

    draw(renderer) {
        this.children.forEach(child => child.draw(renderer));
    }

    getColliders() {
        var colliders = [];
        if (this.collider) {
            colliders.push(this.collider);
        }
        this.children.forEach(child => {
            if (child.getColliders) {
                child.getColliders().forEach(collider => colliders.push(collider));
            }
        })
        return colliders;
    }

    lookAtInstantly(point) {
        this.look_at = point;
        var target_vector = vec3.create();
        vec3.sub(target_vector, this.look_at, position(this.getWorldTransform()));
        var forward_vector = right(this.getWorldTransform());
        var angle = rad2deg(getHorizontalAngle(target_vector, forward_vector));
        // This does not work for robot.body...
        this.local_transform.yaw(angle);
        if (this.parent && !this.independent) {
            mat4.mul(this.world_transform, this.parent.world_transform, this.local_transform.get());
        } else {
            mat4.copy(this.world_transform, this.local_transform.get());
        }
        
        this.children.forEach(child => child.update(0, true));
    }

    update(elapsed, dirty) {
        dirty |= this.local_transform.isDirty();
        if (dirty) {
            if (this.parent && !this.independent) {
                mat4.mul(this.world_transform, this.parent.world_transform, this.local_transform.get());
            } else {
                mat4.copy(this.world_transform, this.local_transform.get());
            }
        }
        this.children.forEach(child => child.update(elapsed, dirty));
        if (this.children.length > 100) {
            console.log("Many children: " + this.children.length);
        }
        
        
        if (this.transition) {
            this.transition.update(elapsed);
        }
    }

    makePickable() {
        this.id = getNextPickableId();
        this.type = PickableType.Default;
        pickable_map.set(this.id, this);
        var make_pickable = (entity, id) => {
            entity.id = id;
            if (entity.children) {
                entity.children.forEach(child => make_pickable(child, id));
            }
        };
        make_pickable(this, this.id);
    }

    getLocalTransform() {
        return this.local_transform.get();
    }

    getWorldTransform() {
        return this.world_transform;
    }

    getWorldPosition() {
        var location = vec3.create();
        mat4.getTranslation(location, this.world_transform);
        return location;
    }

    getLocalPosition() {
        return this.local_transform.getPosition();
    }

    getSquaredHorizontalDistanceToPlayer() {
        if (player) {
            return vec2.sqrDist(vec2.fromValues(this.getWorldPosition()[0], this.getWorldPosition()[2]),
                vec2.fromValues(player.getWorldPosition()[0], player.getWorldPosition()[2]));
        } else {
            return 0;
        }
    }

    getSquaredHorizontalDistanceToActiveCamera() {
        if (player) {
            return vec2.sqrDist(vec2.fromValues(this.getWorldPosition()[0], this.getWorldPosition()[2]),
                vec2.fromValues(active_camera.getWorldPosition()[0], active_camera.getWorldPosition()[2]));
        } else {
            return 0;
        }
    }

    getDistanceToPlayer() {
        if (player) {
            return vec3.dist(this.getWorldPosition(), player.getWorldPosition());
        } else {
            return 0;
        }
    }

    getForwardVector() {
        return vec3.fromValues(this.world_transform[8], this.world_transform[9], this.world_transform[10]);
    }
}

class Transition {
    constructor(entity, keypoints) {
        this.entity = entity;
        this.keypoints = keypoints;
        this.elapsed = 0;
        this.keypoint_index = 0;
        this.done = false;
        this.original_state = {};
        this.getOriginalStateForKeyPoint();
    }

    getOriginalStateForKeyPoint() {
        this.elapsed = 0;
        this.original_state = {};
        for (const [key, value] of Object.entries(this.keypoints[this.keypoint_index].to)) {
            if (typeof this.entity[key] == 'object' && Array.isArray(this.entity[key])) {
                this.original_state[key] = [...this.entity[key]];
            } else {
                this.original_state[key] = this.entity[key];
            }
        }
    }

    update(elapsed) {
        if (!this.done) {
            var keypoint = this.keypoints[this.keypoint_index];
            const t = 0.5 - 0.5 * (Math.cos(this.elapsed / keypoint.time * Math.PI));
            for (const [key, value] of Object.entries(keypoint.to)) {
                switch (typeof (value)) {
                    case 'object':
                        if (Array.isArray(value)) {
                            if (value.length == 2) {
                                vec2.lerp(this.entity[key], this.original_state[key], keypoint.to[key], t);
                            } else if (value.length == 3) {
                                vec3.lerp(this.entity[key], this.original_state[key], keypoint.to[key], t);
                            } else if (value.length == 4) {
                                vec4.lerp(this.entity[key], this.original_state[key], keypoint.to[key], t);
                            }
                        } else {
                            if (this.elapsed >= keypoint.time) {
                                this.entity[key] = keypoint.to[key];
                            }
                        }
                        break;
                    case 'boolean':
                    case 'string':
                        if (this.elapsed >= keypoint.time) {
                            this.entity[key] = keypoint.to[key];
                        }
                        break;
                    case 'number':
                        this.entity[key] = this.original_state[key] + t * (keypoint.to[key] - this.original_state[key]);
                        break;
                }
            }
            if (this.elapsed >= keypoint.time) {
                if (keypoint.callback != undefined) {
                    keypoint.callback();
                }
                this.keypoint_index++;
                if (this.keypoints.length > this.keypoint_index) {
                    this.getOriginalStateForKeyPoint();
                } else {
                    this.done = true;
                }
            }
            this.elapsed += elapsed;
        }
    }
}
