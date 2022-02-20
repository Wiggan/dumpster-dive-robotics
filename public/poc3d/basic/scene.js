'use strict';

class Scene extends Entity {
    constructor(name, entities) {
        super(null, [0, 0, 0]);
        this.name = name;
        this.lights = [];
        this.colliders = [];
        this.camera_anchors = [];
        this.entity_uuid_map = new Map();
        this.entities = entities.map((entity) => {
            if (entity.class && entity.class != 'Player') {
                var e = new classes[entity.class](this, entity.local_position);
                e = Object.assign(e, entity);
                this.entity_uuid_map.set(e.uuid, e);
                this.colliders.push(...e.getColliders());
                if (e.strategy) {
                    e.strategy = Object.assign(new classes[entity.strategy.class](e), entity.strategy);
                }
                return e;
            }
        })
        this.entities = this.entities.filter((entity => entity))
        this.entities_to_draw = [];
    }

    toJSON(key) {
        return {
            name: this.name,
            entities: this.entities
        }
    }

    getCollisionGrid() {
        var collisionGrid = {
            offsetX: 0,
            offsetY: 0,
            grid: []
        }
        var level_colliders = this.colliders.filter(collider => {return collider.type == CollisionLayer.Level;});
        level_colliders.sort((a, b) => {
            if (a.getMidY() == b.getMidY()) {
                return a.getMidX() - b.getMidX();
            } else {
                return a.getMidY() - b.getMidY();
            }
        });
        collisionGrid.offsetX = level_colliders[0].getMidX();
        collisionGrid.offsetY = level_colliders[0].getMidY();
        level_colliders.forEach(collider => {
            var x = collider.getMidX() - collisionGrid.offsetX;
            var y = collider.getMidY() - collisionGrid.offsetY;
            if (!collisionGrid.grid[y]) {
                collisionGrid.grid[y] = [];
            }
            collisionGrid.grid[y][x] = 1;
        });
        return collisionGrid;
    }

    remove(object) {
/*         object.getColliders().forEach(collider => {
            this.colliders.splice(game.scene.colliders.lastIndexOf(collider), 1);
        }); */
        this.entities.splice(game.scene.entities.lastIndexOf(object), 1);
    }


    draw(renderer) {
        this.entities_to_draw.forEach(entity => {
            entity.draw(renderer);
        });
/*         this.lights.forEach((light) => {
            light.draw(renderer);
        }); */
    }

    update(elapsed) {
        // Ensure only 4 lights are active. This should probably be done less often...
        this.lights.sort((a, b) => { return a.getSquaredHorizontalDistanceToPlayer() - b.getSquaredHorizontalDistanceToPlayer();});
        var activeLightCount = this.lights.filter((light) => light.active).length;
        /* this.lights.forEach((light, i) => {
            if (i<4) {
                if (activeLightCount < 4) {
                    //light.activate();
                }
            } else {
                //light.inactivate();
            }
        }); */
        this.entities_to_draw = this.entities.filter(entity => entity.getSquaredHorizontalDistanceToPlayer() < 220);
        this.entities.forEach(entity => {
            entity.update(elapsed, false);
        });
    }
}