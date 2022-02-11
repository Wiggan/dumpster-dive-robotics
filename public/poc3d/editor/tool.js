'use strict'

var selected_entities = [], selected_gui;

function snapToHexPosition(pos) {
    return indexToHexPosition(hexPositionToIndex(pos));
}

function indexToHexPosition(pos) {
    const size = 1;
    return [size * Math.sqrt(3) * (pos[0] + 0.5 * (pos[2]&1)),
        pos[1],
        size * 3/2 * pos[2]];
}

function hexPositionToIndex(pos) {
    const size = 1;
    var iz = Math.round(pos[2] / size * 2 / 3);
    var iy = 0;
    var ix = Math.round(pos[0] / size / Math.sqrt(3) -  0.5 * (iz&1));
    return [ix, iy, iz];
}

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
        } else if (e.key == 'ArrowDown') {
            if (this.selected_tool == 1) {
                this.changeBlock(-1);
            } else if (this.selected_tool == 2) {
                this.changeDynamic(-1);
            }
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
                    selected_gui.add(persistent, key).onChange((v) => selected_entities[0][key] = v);
                } else if (key == 'triggee') {
                    selected_gui.add(persistent, key/*, game.scene.entities.filter(entity => entity.trigger)*/).listen().onChange((v) => {
                        selected_entities[0][key] = v;
                    });
                } else if (key == 'class') {
                    selected_gui.add(persistent, key).onChange((v) => selected_entities[0][key] = v);
                } else if (key == 'patrol_position') {
                    //selected_gui.add(persistent, key).onChange((v) => selected_entities[0][key] = v);
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
        this.local_transform.setPosition(snapToHexPosition(position));
        this.update(0, true);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
    }

    drawSelected(renderer, entity) {
        if (entity) {
            if (entity.model) {
                var transform = mat4.clone(entity.getWorldTransform());
                mat4.scale(transform, transform, [1.1, 1.0, 1.1]);
                renderer.add_drawable(entity.model, materials.light, transform);
            }
            entity.children.forEach(child => this.drawSelected(renderer, child));
        }
    }

    setPicking(p) {
        picking = p;
        if (!picking) {
            selected_id = 0;
        }
    }
}
