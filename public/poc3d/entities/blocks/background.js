'use strict';

class Background extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_position = local_position;
        this.background = new Drawable(this, [0, -1.4 + Math.random()*0.1, 0], models.background);
        this.background.material = materials.dirt;
        this.background.local_transform.yaw(Math.floor(Math.random()*4)*90);
        this.background.local_transform.roll(Math.floor(Math.random()*4)*90);
        this.background.local_transform.pitch(Math.floor(Math.random()*4)*90);
    }

    init(scene) {
        var x = this.getWorldPosition()[0];
        var y = this.getWorldPosition()[2];
        if(scene.colliders.filter(collider => collider.type == CollisionLayer.Level).filter(collider => collider.getMidX() == x && collider.getMidY() == y + 1).length > 0) {
            this.boulders = new Drawable(this, [0, -0.6, 0.5], models.boulders);
            this.boulders.local_transform.yaw(Math.floor(Math.random()*2)*180);
            this.boulders.local_transform.pitch(Math.random()*360);
            this.boulders.local_transform.roll(Math.floor(Math.random()*2)*180);
            this.boulders.material = materials.dirt;
        }
    }

    toJSON(key) {
        return {
            class: 'Background',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }
}


classes.Background = Background;