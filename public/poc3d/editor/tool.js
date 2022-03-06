'use strict'

var selected_entities = [], selected_gui;


class Tool extends Entity {
    constructor() {
        super(null, [0,0,0]);
        this.click_start = undefined;
        this.click_end = undefined;
        this.clicked_entity_start = undefined;
    }

    onKeyDown(e) {
        if (e.key == 'a' || e.key == 'A') {
            if (e.shiftKey) {
                selected_entities.length = 0;
            } 
        }
        if (e.key == 'ArrowUp') {
            if (this.selected_tool == 1) {
                this.changeBlock(1);
            } else if (this.selected_tool == 2) {
                this.changeDynamic(1);
            }
            e.preventDefault();
        } else if (e.key == 'ArrowDown') {
            if (this.selected_tool == 1) {
                this.changeBlock(-1);
            } else if (this.selected_tool == 2) {
                this.changeDynamic(-1);
            }
            e.preventDefault();
        }
    }

    getBlockInPosition(pos) {
        return game.scene.entities.find(entity => {
            var pos1 = entity.getWorldPosition();
            return Math.abs(pos1[0] - pos[0]) < 0.01 && Math.abs(pos1[2] - pos[2]) < 0.01;
        });
    }

    placeBlockInScene(class_name, position) {
        var blockInPosition = this.getBlockInPosition(this.getWorldPosition());
        if (blockInPosition) {
            game.scene.remove(blockInPosition);
        }
        var new_entity = new classes[class_name](game.scene, position);    
        if (!new_entity.id) {
            new_entity.makePickable();
        }
        game.scene.entities.push(new_entity);
    }
    
    changeDynamic(delta) {
        var dynamic_index = (this.dynamic_index + delta) % this.dynamics.length;
        if (dynamic_index < 0) dynamic_index += this.dynamics.length;
        this.dynamic_index = dynamic_index;
        this.removeAllChildren();
        this.addChild(this.dynamics[this.dynamic_index]);
    }

    onKeyUp(e) {
    }

    updateSelectedGui() {
        if (selected_gui) {
            gui.removeFolder(selected_gui);
        }
        selected_gui = gui.addFolder('Selected');
        if (selected_entities.length == 1 && selected_entities[0]) {
            var persistent = selected_entities[0].toJSON();
            Object.assign(selected_entities[0], persistent);
            for (const [key, value] of Object.entries(persistent)) {
                if (key == 'destination_uuid') {
                    selected_gui.add(persistent, key/*, Object.keys(game.scenes)*/).onChange((v) => selected_entities[0][key] = v);
                } else if (key == 'uuid') {
                    selected_gui.add(selected_entities[0], key);
                } else if (key == 'force') {
                    selected_gui.add(selected_entities[0], key);
                } else if (key == 'range') {
                    selected_gui.add(selected_entities[0], key);
                } else if (key == 'triggees') {
                    var triggees = Object.assign({}, selected_entities[0][key]);
                    var triggeesFolder = selected_gui.addFolder(key);
                    Object.keys(triggees).forEach((k) => {
                        triggeesFolder.add(triggees, k).listen().onChange((v) => {
                            selected_entities[0][key][k] = v;
                        });
                    });
                } else if (key == 'class') {
                    selected_gui.add(persistent, key).onChange((v) => selected_entities[0][key] = v);
                } else if (key == 'local_position') {
                    var local_position = Object.assign({}, selected_entities[0].getWorldPosition());
                    var posFolder = selected_gui.addFolder(key);
                    Object.keys(local_position).forEach((k) => {
                        posFolder.add(local_position, k).onChange((v) => {
                            var newPos = vec3.clone(selected_entities[0].getWorldPosition());
                            newPos[Number(k)] = v;
                            selected_entities[0].local_transform.setPosition(newPos);
                            selected_entities[0].local_position = newPos;
                            selected_entities[0].update(0, true);
                        });
                    });
                    posFolder.open();
                } else if (key == 'strategy') {
                    var posFolder = selected_gui.addFolder(key);
                    if (persistent.strategy.toJSON().class == 'PatrolStrategy' || persistent.strategy.toJSON().class == 'BossStrategy') {
                        persistent.strategy.patrol_points.forEach((point, i) => {
                            var pointFolder = posFolder.addFolder('point ' + i);
                            var local_position = Object.assign({}, point);
                            Object.keys(local_position).forEach((k) => {
                                pointFolder.add(local_position, k, -1000, 1000, 1).onChange((v) => {
                                    selected_entities[0].strategy.patrol_points[i][Number(k)] = v;
                                });
                            });
                        })
                    }
                }
            }
        }
        selected_gui.open();

    }

    selectEntity(entity) {
        if (!selected_entities.includes(entity) && entity != active_camera) {
            selected_entities.push(entity);
            this.updateSelectedGui();
        }
    }
    
    deselectEntity(entity) {
        selected_entities.splice(selected_entities.indexOf(entity), 1);
        this.updateSelectedGui();
    }

    onmousedown(e, clicked_entity) {
        this.clicked_entity_start = clicked_entity;
        this.click_start = this.getWorldPosition();
        e.preventDefault();
    }

    onmouseup(e, clicked_entity) {
        this.click_end = this.getWorldPosition();
        e.preventDefault();
    } 

    onclick(e) {
        e.preventDefault();
    }

    isEntityInsideRectangle(pos1, pos2, entity) {
        var pos = entity.getWorldPosition();
        return Math.min(pos1[0], pos2[0]) <= pos[0] && 
               pos[0] <= Math.max(pos1[0], pos2[0]) && 
               Math.min(pos1[2], pos2[2]) <= pos[2] && 
               pos[2] <= Math.max(pos1[2], pos2[2]);
    }

    setPosition(position) {
        this.local_transform.setPosition(snapToGrid(position));
        this.update(0, true);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
    }

    drawSelected(renderer, entity) {
        if (entity) {
            if (entity.model) {
                var transform = mat4.clone(entity.getWorldTransform());
                mat4.scale(transform, transform, [1.01, 1.01, 1.01]);
                renderer.add_drawable(entity.model, materials.light, transform);
            }
            if (entity.children) {
                entity.children.forEach(child => this.drawSelected(renderer, child));
            }
            if (entity.strategy) {
                if (entity.toJSON().strategy.toJSON().class == 'PatrolStrategy' || entity.toJSON().strategy.toJSON().class == 'BossStrategy') {
                    entity.strategy.patrol_points.forEach(point => {
                        debugDraw(renderer, point);
                    });
                }
            }
        }
    }

    setPicking(p) {
        picking = p;
        if (!picking) {
            selected_id = 0;
        }
    }
}
