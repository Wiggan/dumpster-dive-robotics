'use strict';

class Drawable extends Entity {
    constructor(parent, local_position, model) {
        super(parent, local_position);
        this.model = model;
        this.material = materials.wall;
    }

    draw(renderer) {
        renderer.add_drawable(this.model, this.material, this.getWorldTransform(), this.id);
        super.draw(renderer);
    }
}