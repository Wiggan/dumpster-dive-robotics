'use strict'

class SelectionTool extends Tool {
    constructor() {
        super();
    }

    onKeyDown(e) {
        super.onKeyDown(e);
        if ((e.key == 'g' || e.key == 'G') && !e.repeat) {
            this.moving = true;
            this.moving_start_point = this.getWorldPosition();
        }
    }
    
    onKeyUp(e) {
        super.onKeyUp(e);
        if (e.key == 'g' || e.key == 'G') {
            this.moving = false;
            var translation = [this.getWorldPosition()[0] - this.moving_start_point[0], 0, this.getWorldPosition()[2] - this.moving_start_point[2]];
            if (e.shiftKey) {
                selected_entities.forEach(entity => {
                    var copy_position = snapToHexPosition([entity.getWorldPosition()[0] + translation[0], 0, entity.getWorldPosition()[2] + translation[2]]);
                    this.placeBlockInScene(entity.toJSON().class, copy_position);
                });
            } else {
                selected_entities.forEach(entity => {
                    var new_position = vec3.create();
                    vec3.add(new_position, entity.getWorldPosition(), translation);
                    new_position = snapToHexPosition(new_position);
                    var blockInPosition = this.getBlockInPosition(new_position);
                    if (blockInPosition && !selected_entities.includes(blockInPosition)) {
                        game.scene.remove(blockInPosition);
                    }
                    entity.local_transform.translate(snapToHexPosition(translation));
                });
            }
        } else if (e.key == 'Delete') {
            selected_entities.forEach(entity => {
                game.scene.remove(entity);
            });
        }

    }

    onmousedown(e, clicked_entity) {
        super.onmousedown(e, clicked_entity);
    }
    
    onmouseup(e, clicked_entity) {
        super.onmouseup(e, clicked_entity);
        // Connect trigger
        
        if (e.button == 0) {
            if (e.shiftKey && e.ctrlKey) {
                if (selected_entities.length == 1) {
                    if (selected_entities[0].collider.type == CollisionTypes.Trigger && clicked_entity.trigger) {
                        console.log("Connected trigger and triggee");
                        selected_entities[0].triggee = clicked_entity.uuid;
                    } else if (selected_entities[0].toJSON().class == 'Portal' && clicked_entity.toJSON().class == 'Portal') {
                        console.log("Connected portals");
                        selected_entities[0].destination_uuid = clicked_entity.uuid;
                        clicked_entity.destination_uuid = selected_entities[0].uuid;
                    } else if (selected_entities[0].toJSON().class == 'Drone') {
                        console.log("Set partol position for drone");
                        selected_entities[0].patrol_position = this.getWorldPosition();
                    }
                }
            } else {
                if (!e.shiftKey) {
                    selected_entities.length = 0;
                }
                if (this.clicked_entity_start == clicked_entity && this.clicked_entity_start && clicked_entity) {
                    this.selectEntity(clicked_entity);
                } else {
                    var entities = game.scene.entities.filter(entity => this.isEntityInsideRectangle(this.click_start, this.click_end, entity));
                    entities.forEach(entity => this.selectEntity(entity));
                }
            }
        } else if (e.button == 2) {
            this.deselectEntity(clicked_entity);
        }
    }

    setPosition(position) {
        this.local_transform.setPosition(position);
        this.update(0, true);
    }

    draw(renderer) {
        selected_entities.forEach(entity => {
            this.drawSelected(renderer, entity);
        });
    }
    
    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        picking = true;
    }
}