'use strict';

const pickable_map = new Map();
var last_added_id = 1;
function getNextPickableId() {
    while(pickable_map.has(last_added_id)) {
        last_added_id++;
    }
    return last_added_id;
}
var selected_id = 0;

const PickableType = {
    Enemy: 'Enemy',
    Default: 'Default'
}

class Pickable extends Entity {
    constructor(parent, local_position, label) {
        super(parent, local_position);
        this.label = label;
        this.makePickable();
    }

    make_unpickable() {
        pickable_map.delete(this.id);
        this.id = undefined;
    }
    
    draw(renderer) {
        super.draw(renderer);
        if (alt_pressed || selected_id == this.id) {
            var pos = this.getWorldPosition();
            if (this.type == PickableType.Enemy) {                
                pos[1] += 1;
                renderer.add_textbox({pos: pos, text: this.name, health: this.health / this.max_health});
            } else {
                renderer.add_textbox({pos: pos, text: this.label});
            }
        }
    }
}