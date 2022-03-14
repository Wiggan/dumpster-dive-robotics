'use strict'

class Goal extends Pickable {
    constructor(scene, position) {
        super(null, position);
        this.local_position = position;
        this.scene = scene;
        this.box = new Background(this, [0, 0, 0]);
        this.box.background.material = materials.gold_light;
        this.particle_socket = new Entity(this, [0, 0, 0]);
        this.particles = new Blue(this.particle_socket, [0, 1, -0.5]);
        this.rotation_speed = 1;
        this.active = true;
        this.label = "The Way Out";
    }

    toJSON(key) {
        return {
            class: 'Goal',
            uuid: this.uuid,
            local_position: this.local_position
        };
    }


    interact() {
        game.paused = true;
        if (player.moving_sound) {
            player.moving_sound.stop();
            player.moving_sound = undefined;
        }
        game.transition = new Transition(game, [
            {
                time: 4000,
                to: { overlay: [0.0, 0.0, 0.0, 1.0]},
                callback: () => {
                    showVictoryScreen();
                    
                }
            }
        ]);
    }

    update(elapsed, dirty) {
        this.particle_socket.local_transform.yaw(elapsed * this.rotation_speed);
        this.particle_socket.local_transform.setPosition([0, Math.sin(Date.now()*0.005), 0]);
        super.update(elapsed, true);
    }
}

classes.Goal = Goal;