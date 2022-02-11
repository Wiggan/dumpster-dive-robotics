'use strict';

class Transform {
    #position;
    #scale;
    #yaw;
    #pitch;
    #roll;
    #dirty;
    #transform;
    constructor(position) {
        if (position) {
            this.#position = vec3.fromValues(position[0], position[1], position[2]);
        } else {
            this.#position = vec3.create();
        }
        this.#scale = vec3.fromValues(1, 1, 1);
        this.#yaw = 0;
        this.#pitch = 0;
        this.#roll = 0;
        this.#dirty = true;
        this.#transform = mat4.create();
    }
    
    get() {
        if (this.#dirty) {
            mat4.identity(this.#transform);
            mat4.translate(this.#transform, this.#transform, this.#position);
            mat4.rotateZ(this.#transform, this.#transform, deg2rad(this.#roll));
            mat4.rotateY(this.#transform, this.#transform, deg2rad(this.#yaw));
            mat4.rotateX(this.#transform, this.#transform, deg2rad(this.#pitch));
            mat4.scale(this.#transform, this.#transform, this.#scale);
            this.#dirty = false;
        }
        return this.#transform;
    }

    setPosition(position) {
        this.#dirty = true;
        this.#position = vec3.fromValues(position[0], position[1], position[2]);
    }

    getPosition() {
        return this.#position;
    }

    translate(movement) {
        this.#dirty = true;
        vec3.add(this.#position, this.#position, movement);
    }

    getYaw() {
        return this.#yaw;
    }

    setYaw(yaw) {
        this.#dirty = true;
        this.#yaw = yaw;
    }

    yaw(delta) {
        this.#dirty = true;
        this.#yaw += delta;
    }

    pitch(delta) {
        this.#dirty = true;
        this.#pitch += delta;
    }

    getPitch() {
        return this.#pitch;
    }

    setPitch(pitch) {
        this.#dirty = true;
        this.#pitch = pitch;
    }

    roll(delta) {
        this.#dirty = true;
        this.#roll += delta;
    }

    scale(scale) {
        this.#dirty = true;
        this.#scale = vec3.fromValues(scale, scale, scale);
    }

    isDirty() {
        return this.#dirty;
    }
}