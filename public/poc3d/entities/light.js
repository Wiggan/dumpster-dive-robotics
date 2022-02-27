'use strict';

class Light extends Drawable {
    constructor(parent, local_position) {
        super(parent, local_position, models.box);
        this.light = new PointLight(this, [0, 6, 0], parent);
        this.local_position = local_position;
        this.light.ambient = [0.0, 0.0, 0.0];
        this.light.diffuse = [0.7, 0.7, 0.6];
        this.light.specular = [0.8, 0.8, 0.8];
        this.light.constant = 1.0;
        this.light.linear = 1.1;
        this.light.quadratic = 0.65;
        this.local_transform.scaleUniform(0.3);
        this.material = materials.light;
    }
    

    toJSON(key) {
        return {
            class: 'Light',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}

classes.Light = Light;