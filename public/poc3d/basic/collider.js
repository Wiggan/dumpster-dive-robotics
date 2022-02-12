'use strict'

const CollisionTypes = {
    Level: 1,
    Enemy: 2,
    Projectile: 4,
    Trigger: 8,
    Player: 16
};

const collisionMap = new Map();
collisionMap.set(CollisionTypes.Level + CollisionTypes.Enemy, true);
collisionMap.set(CollisionTypes.Level + CollisionTypes.Projectile, true);
collisionMap.set(CollisionTypes.Level + CollisionTypes.Trigger, false);
collisionMap.set(CollisionTypes.Level + CollisionTypes.Player, true);
collisionMap.set(CollisionTypes.Level + CollisionTypes.Enemy, true);
collisionMap.set(CollisionTypes.Enemy + CollisionTypes.Projectile, true);
collisionMap.set(CollisionTypes.Enemy + CollisionTypes.Trigger, false);
collisionMap.set(CollisionTypes.Enemy + CollisionTypes.Player, true);
collisionMap.set(CollisionTypes.Projectile + CollisionTypes.Trigger, false);
collisionMap.set(CollisionTypes.Projectile + CollisionTypes.Player, true);
collisionMap.set(CollisionTypes.Trigger + CollisionTypes.Player, true);

class Collider {
    constructor(parent, local_position, type, width, height) {
        this.parent = parent;
        this.local_position = local_position;
        this.world_position = vec3.create();
        vec3.transformMat4(this.world_position, this.local_position, parent.getWorldTransform());
        this.type = type;
        this.width = width;
        this.height = height;
    }


    isColliding(other) {
        if (this.parent != other.parent && collisionMap.get(this.type + other.type)) {
            var rect1 = {
                x: this.world_position[0],
                y: this.world_position[2],
                w: this.width,
                h: this.height
            };
            var rect2 = {
                x: other.world_position[0],
                y: other.world_position[2],
                w: other.width,
                h: other.height
            };
            return (rect1.x < rect2.x + rect2.w &&
                rect1.x + rect1.w > rect2.x &&
                rect1.y < rect2.y + rect2.h &&
                rect1.h + rect1.y > rect2.y);               
        }
        return false;
    }
};