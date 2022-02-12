'use strict'

class CameraAnchor extends Entity {
    constructor(scene, position) {
        super(null, position);
        this.local_position = position;
        this.drawable = new Drawable(this, [0, 0, 0], models.box);
        this.force = 10;
        
        if (scene) {
            scene.camera_anchors.push(this);
        }
    }

    draw(renderer) {
        if (debug) {
            this.drawable.draw(renderer);
        }
    }

    toJSON(key) {
        return {
            class: 'CameraAnchor',
            uuid: this.uuid,
            local_position: this.local_position,
            force: this.force
        };
    }

}

classes.CameraAnchor = CameraAnchor;
