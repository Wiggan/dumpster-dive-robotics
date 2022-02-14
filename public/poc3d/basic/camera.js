'use strict';

var cameras = [];
var active_camera;
var alt_pressed = false;
var ctrl_pressed = false;



class Camera extends DynamicEntity {
    constructor(parent, local_position) {
        super(parent, local_position);
        cameras.push(this);
        active_camera = this;
        this.model = models.box;
        this.debug = true;
    }

    getViewMatrix() {
        var viewMatrix = mat4.create();
        //mat4.identity(viewMatrix);
        mat4.invert(viewMatrix, this.getWorldTransform());
        return viewMatrix;
    }

    getPosition() {
        var position = vec3.create(); 
        mat4.getTranslation(position, this.getWorldTransform());
        return position;
    }

    onKeyDown(e) {
        if (e.key == 'F1') {
            debug = !debug;
            e.preventDefault();
        } else if (e.key == 'F2') {
            cameras[(cameras.indexOf(active_camera)+1) % cameras.length].activate();
            e.preventDefault();
        } else if (e.key == 'F3') {
            game.save();
            e.preventDefault();
        } else if (e.key == 'F4') {
            game.load();
            e.preventDefault();
        }
    }

    draw(renderer) {
        if (debug && active_camera != this) {
            //renderer.add_drawable(this);
        }
    }

    deactivate() {}
    activate() {
        active_camera.deactivate();
        active_camera = this;
    }
}
