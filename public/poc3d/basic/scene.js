'use strict';

const Tiles = {
    Wall: 0,
    Floor: 1,
    Lantern: 2,
    Drone: 3,
    Chest: 4
};

function getHexPosition(ix, y, iz) {
    const size = 1;
    return [size * Math.sqrt(3) * (ix + 0.5 * (iz&1)),
        y,
        size * 3/2 * iz];
}


class Scene extends Entity {
    constructor(name, entities) {
        super(null, [0, 0, 0]);
        this.name = name;
        this.lights = [];
        this.entity_uuid_map = new Map();
        this.entities = entities.map((entity) => {
            if (entity.class) {
                var e = new classes[entity.class](this, entity.local_position);
                e = Object.assign(e, entity);
                this.entity_uuid_map.set(e.uuid, e);
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

    remove(object) {
        this.entities.splice(game.scene.entities.lastIndexOf(object), 1);
    }

    makeArray(w, h, val) {
        var arr = [];
        for(let i = 0; i < h; i++) {
            arr[i] = [];
            for(let j = 0; j < w; j++) {
                arr[i][j] = val;
            }
        }
        return arr;
    }

    generate(points_of_interest) {
        var level = this.makeArray(100, 100, 0);
        var tail = points_of_interest.pop();
        level[tail[0]][tail[1]] = 2;
        const max_attempts = 200;
        var attempts = 0;
        while (points_of_interest.length > 0) {
            var target = points_of_interest.pop();
            while (level[target[0]][target[1]] == 0 && attempts < max_attempts) {
                var dir;
                // Often walk towards the endpoint
                if (Math.random() < 0.3) {
                    dir = direction({x: tail[0], y: tail[1]}, {x: target[0], y: target[1]});
                } else {
                    dir = random_direction();
                }
                if (Math.abs(dir.x) > Math.abs(dir.y)) {
                    tail[0] += Math.round(dir.x);
                } else {
                    tail[1] += Math.round(dir.y);
                }
                //this.add(Array.from(tail));
                if (tail[0] == target[0] && tail[1] == target[1]) {
                    level[tail[0]][tail[1]] = 2; 
                } else {
                    level[tail[0]][tail[1]] = 1;
                    if (Math.random() < 0.2) {
                        level[tail[0]][tail[1]] = 2; 
                    } else if (Math.random() < 0.4) {
                        level[tail[0]][tail[1]] = 3; 
                    } else if (Math.random() < 0.1) {
                        level[tail[0]][tail[1]] = 4; 
                    } 
                }
                // Sometimes fatten up around the newly added tile
                if (Math.random() < 0.9) {
                    var tile1 = Array.from(tail);
                    var tile2 = Array.from(tail);
                    const index = Math.floor(Math.random()*2);
                    tile1[index]++;
                    tile2[index]--;
                    level[tile1[0]][tile1[1]] = 1; 
                    level[tile2[0]][tile2[1]] = 1;
                    //if (Math.random() < 0.2) {
                    //    this.monsters.push(new Monster({x: tail[0]*tile_size, y: tail[1]*tile_size}));
                    //    this.monsters.push(new Monster({x: tile1[0]*tile_size, y: tile1[1]*tile_size}));
                    //    this.monsters.push(new Monster({x: tile2[0]*tile_size, y: tile2[1]*tile_size}));
                    //}
                }
                attempts++;
            }
        }
        console.log("Generated 2d array");
        return level;
    }

    parse_level(level) {
        this.name = level.name;
        for (var x = 0; x < level.tiles[0].length; x++) {
            for (var y = 0; y < level.tiles.length; y++) {
                switch(level.tiles[y][x]) {
                    case 0:
                        var hex = new Wall(null, getHexPosition(x, 0, y));
                        this.entities.push(hex);
                        break;
                    case 1:
                        this.entities.push(new Floor(null, getHexPosition(x, 0, y)));
                        break;
                    case 2:
                        this.entities.push(new Lantern(this, getHexPosition(x, 0, y)));
                        break;
                    case 3:
                        this.entities.push(new Floor(null, getHexPosition(x, 0, y)));
                        this.entities.push(new Chest(null, getHexPosition(x, 0, y)));
                        break;
                    case 4:
                        this.entities.push(new Floor(null, getHexPosition(x, 0, y)));
                        this.entities.push(new Drone(null, getHexPosition(x, 0, y)));
                        break;

                }
            }
        }
    }

    draw(renderer) {
        this.entities_to_draw.forEach(entity => {
            entity.draw(renderer);
        });
        this.lights.forEach((light) => {
            light.draw(renderer);
        });
    }

    update(elapsed) {
        // Ensure only 4 lights are active. This should probably be done less often...
        this.lights.sort((a, b) => { return a.getSquaredHorizontalDistanceToPlayer() - b.getSquaredHorizontalDistanceToPlayer();});
        var activeLightCount = this.lights.filter((light) => light.active).length;
        this.lights.forEach((light, i) => {
            if (i<4) {
                if (activeLightCount < 4) {
                    light.activate();
                }
            } else {
                light.inactivate();
            }
        });
        this.entities_to_draw = this.entities.filter(entity => entity.getSquaredHorizontalDistanceToPlayer() < 120);
        this.entities.forEach(entity => {
            entity.update(elapsed, false);
        });
    }
}