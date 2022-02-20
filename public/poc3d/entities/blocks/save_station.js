'use strict'

class SaveStation extends Pickable {
    constructor(scene, position) {
        super(null, position);
        this.local_position = position;
        this.background = new Background(this, [0, 0, 0]);
        this.particle_socket = new Entity(this, [0, 0, 0]);
        this.particles = new Blue(this.particle_socket, [0, 0.5, -0.5], [0, 0, -1]);
        this.particles.start.color = [0.5, 0, 0.5];
        this.rotation_speed = 1;
        this.scale = 1;
        this.label = "Save Station";
    }

    toJSON(key) {
        return {
            class: 'SaveStation',
            uuid: this.uuid,
            local_position: this.local_position
        };
    }

    interact() {
        game.save();

        this.particles.start.color = [0.9, 0.5, 0.9];
        this.transition = new Transition(this, [
            {
                time: 1000,
                to: { scale: 2, rotation_speed: 2},
                callback: () => {
                    this.particles.start.color = [0.4, 0, 0.4];
                }
            },
            {
                time: 1000,
                to: { scale: 1, rotation_speed: 1}
            }
        ]);
    }
    
    update(elapsed, dirty) {
        if (this.transition) {
            this.transition.update(elapsed);
        }
        this.particle_socket.local_transform.scaleUniform(this.scale);
        this.particle_socket.local_transform.roll(elapsed * this.rotation_speed);
        this.particle_socket.local_transform.setPosition([0, 0, Math.sin(Date.now()*0.005)]);
        super.update(elapsed, true);
    }
}

classes.SaveStation = SaveStation;