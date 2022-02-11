'use strict'

class Portal extends Pickable {
    constructor(scene, position) {
        super(null, position);
        this.local_position = position;
        this.scene = scene;
        this.hex = new Floor(this, [0, 0.1, 0]);
        this.hex.material = materials.blue;
        this.particle_socket = new Entity(this, [0, 0, 0]);
        this.particles = new Blue(this.particle_socket, [0, 1, -0.5]);
        this.rotation_speed = 1;
        this.label = "Portal";
        this.destination_uuid = '';
    }

    toJSON(key) {
        return {
            class: 'Portal',
            uuid: this.uuid,
            local_position: this.local_position,
            destination_uuid: this.destination_uuid
        };
    }

    interact() {
        var destination_portal;
        
        for (const [key, value] of Object.entries(game.scenes)) {
            if (value.entity_uuid_map.has(this.destination_uuid)) {
                destination_portal = value.entity_uuid_map.get(this.destination_uuid);
                break;
            }    
        }
        game.changeScene(destination_portal.scene, destination_portal.getWorldPosition());
    }
    
    update(elapsed, dirty) {
        this.particle_socket.local_transform.yaw(elapsed * this.rotation_speed);
        this.particle_socket.local_transform.setPosition([0, Math.sin(Date.now()*0.005), 0]);
        super.update(elapsed, true);
    }
}

classes.Portal = Portal;