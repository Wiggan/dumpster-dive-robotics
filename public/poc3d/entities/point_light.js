'use strict';

class PointLight extends Entity {
    constructor(parent, local_position, scene) {
        super(parent, local_position);
        if (scene) {
            scene.lights.push(this);
        }
        this.active = false;
        this.ambient = [0.2, 0.2, 0.3];
        this.diffuse = [0.4, 0.4, 0.6];
        this.specular = [0.8, 0.8, 0.8];
        this.constant = 1.0;
        this.linear = 0.35;
        this.quadratic = 0.9;
    }
    
    getPosition() {
        var position = vec3.create(); 
        mat4.getTranslation(position, this.getWorldTransform());
        return position;
    }

    draw(renderer) {
        super.draw(renderer);
        if (this.active) {
            renderer.add_light(this);
        }
    }

    activate() {
        this.active = true;
    }
    inactivate() {
        this.active = false;
    }
}