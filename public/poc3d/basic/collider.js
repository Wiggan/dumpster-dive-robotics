'use strict'

const CollisionType = {
    Kinematic: 'Kinematic',
    Dynamic: 'Dynamic'
};

const CollisionLayer = {
    Level: 1,
    Enemy: 2,
    Projectile: 4,
    Trigger: 8,
    Player: 16,
    Sensor: 32
};

const collisionMap = new Map();
collisionMap.set(CollisionLayer.Level + CollisionLayer.Enemy, true);
collisionMap.set(CollisionLayer.Level + CollisionLayer.Projectile, true);
collisionMap.set(CollisionLayer.Level + CollisionLayer.Trigger, false);
collisionMap.set(CollisionLayer.Level + CollisionLayer.Player, true);
collisionMap.set(CollisionLayer.Level + CollisionLayer.Enemy, true);
collisionMap.set(CollisionLayer.Enemy + CollisionLayer.Projectile, true);
collisionMap.set(CollisionLayer.Enemy + CollisionLayer.Trigger, false);
collisionMap.set(CollisionLayer.Enemy + CollisionLayer.Player, true);
collisionMap.set(CollisionLayer.Projectile + CollisionLayer.Trigger, false);
collisionMap.set(CollisionLayer.Projectile + CollisionLayer.Player, true);
collisionMap.set(CollisionLayer.Trigger + CollisionLayer.Player, true);
collisionMap.set(CollisionLayer.Sensor + CollisionLayer.Level, true);
collisionMap.set(CollisionLayer.Sensor + CollisionLayer.Enemy, false);
collisionMap.set(CollisionLayer.Sensor + CollisionLayer.Projectile, false);
collisionMap.set(CollisionLayer.Sensor + CollisionLayer.Trigger, false);
collisionMap.set(CollisionLayer.Sensor + CollisionLayer.Player, false);

class Collider {
    constructor(parent, local_position, type, width, height) {
        this.parent = parent;
        this.local_position = local_position;
        this.local_transform = new Transform(local_position);
        this.world_transform = mat4.clone(this.local_transform.get());
        if (this.parent) {
            mat4.mul(this.world_transform, this.parent.world_transform, this.local_transform.get());
            this.parent.children.push(this);
            this.id = parent.id;
        }
        this.type = type;
        this.local_transform.scale([width, 1, height]);
        this.width = width;
        this.height = height;
        this.half_width = width*0.5;
        this.half_height = height*0.5;
    }

    // Getters for the mid point of the rect
    getMidX() {
        return this.getWorldPosition()[0];
    }
    getMidY() {
        return this.getWorldPosition()[1];
    }

    // Getters for the top, left, right, and bottom
    // of the rectangle
    getTop() {
        return this.getMidY() - this.half_height;
    }
    getLeft() {
        return this.getMidX() - this.half_width;
    }
    getRight() {
        return this.getLeft() + this.width;
    }
    getBottom() {
        return this.getTop() + this.height;
    }

    getWorldPosition() {
        var location = vec3.create();
        mat4.getTranslation(location, this.world_transform);
        return [location[0], location[2]];
    }

    isColliding(other) {
        if (this.parent != other.parent && collisionMap.get(this.type + other.type)) {
            var rect1 = {
                x: this.getLeft(),
                y: this.getTop(),
                w: this.width,
                h: this.height
            };
            var rect2 = {
                x: other.getLeft(),
                y: other.getTop(),
                w: other.width,
                h: other.height
            };
            var collides = (rect1.x < rect2.x + rect2.w &&
                rect1.x + rect1.w > rect2.x &&
                rect1.y < rect2.y + rect2.h &&
                rect1.h + rect1.y > rect2.y);
            return collides;
        }
        return false;
    }

    update(elapsed, dirty) {
        dirty |= this.local_transform.isDirty();
        if (dirty) {
            mat4.mul(this.world_transform, this.parent.getWorldTransform(), this.local_transform.get());
        }
    }

    detectCollisions() {
        var collisions = [];
        game.scene.colliders.forEach((other) => {
            if (other && this.isColliding(other)) {
                if (this.parent == player && other.type == CollisionLayer.Trigger) {
                    console.log("player and trigger");
                }
                collisions.push(other);
            }
        });
        return collisions;
    }

    draw(renderer) {
        if (debug) {
            if (this.type == CollisionLayer.Enemy) {
                renderer.add_drawable(models.box, materials.red_led, this.world_transform);
            } else if (this.type == CollisionLayer.Trigger) {
                renderer.add_drawable(models.box, materials.green_led, this.world_transform);
            } else if (this.type == CollisionLayer.Sensor) {
                renderer.add_drawable(models.box, materials.green_led, this.world_transform);
            } else {
                renderer.add_drawable(models.box, materials.light, this.world_transform);
            }
        }
    }
};