'use strict'

var debug = false;

class DebugCamera extends Camera {
    constructor(position) {
        super(null, position);
        this.vel = [0, 0];
        this.speed = 0.01;
        this.local_transform.yaw(-60);

        var canvas = utils.getCanvas('game_canvas');
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

        // Hook pointer lock state change events for different browsers
        document.addEventListener('pointerlockchange', this.lockChangeAlert, false);
        document.addEventListener('mozpointerlockchange', this.lockChangeAlert, false);
    
    }

    lockChangeAlert() {
        if (document.pointerLockElement === gl.canvas || document.mozPointerLockElement === gl.canvas) {
          console.log('The pointer lock status is now locked');
          document.addEventListener("mousemove", active_camera.updatePosition, false);
        } else {
          console.log('The pointer lock status is now unlocked');
          document.removeEventListener("mousemove", active_camera.updatePosition, false);
        }
    }

    deactivate() {
        document.exitPointerLock();
        document.removeEventListener("mousemove", active_camera.updatePosition, false);
    }

    updatePosition(e) {
        var yaw = -e.movementX/10;
        var pitch = -e.movementY/10;
        active_camera.local_transform.yaw(yaw);
        if (-80 < active_camera.local_transform.getPitch() + pitch && 
            active_camera.local_transform.getPitch() + pitch < 80) {
            active_camera.local_transform.pitch(pitch);

        }
    }

    onKeyDown(e) {
        super.onKeyDown(e);
        if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') {
            this.vel[1] = this.speed;
            e.preventDefault();
        } else if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') {
            this.vel[0] = -this.speed;
            e.preventDefault();
        } else if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') {
            this.vel[0] = this.speed;
            e.preventDefault();
        } else if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') {
            this.vel[1] = -this.speed;
            e.preventDefault();
        } else if (e.key == ' ') {
            //this.local_transform.lookAt([0,0,0]);
            e.preventDefault();
        }
    }

    onKeyUp(e) {
        if (e.key == 'ArrowDown' || e.key == 's' || e.key == 'S') {
            this.vel[1] = 0;
            e.preventDefault();
        } else if (e.key == 'ArrowLeft' || e.key == 'a' || e.key == 'A') {
            this.vel[0] = 0;
            e.preventDefault();
        } else if (e.key == 'ArrowRight' || e.key == 'd' || e.key == 'D') {
            this.vel[0] = 0;
            e.preventDefault();
        } else if (e.key == 'ArrowUp' || e.key == 'w' || e.key == 'W') {
            this.vel[1] = 0;
            e.preventDefault();
        }
    }

    onclick(e) {
        var canvas = utils.getCanvas('game_canvas');
        canvas.requestPointerLock();
    }
    
    onmousedown(e) {
        e.preventDefault();
    }
    onmouseup(e) {
        e.preventDefault();
    } 


    update(elapsed, dirty) {
        const viewMatrix = this.getViewMatrix();
        //var translation = vec3.fromValues(this.vel[0]*elapsed, 0.0, this.vel[1]*elapsed);
        //this.local_transform.translate(translation);
        var forward = vec3.fromValues(viewMatrix[2], viewMatrix[6], viewMatrix[10]);
        var right = vec3.fromValues(viewMatrix[0], viewMatrix[4], viewMatrix[8]);
        //var forward = vec3.fromValues(0, 0, 1);
        //var right = vec3.fromValues(1, 0, 0);
        var translation = vec3.create();
        vec3.scale(forward, forward, this.vel[1]*elapsed);
        vec3.scale(right, right, this.vel[0]*elapsed);
        vec3.add(translation, forward, right);
        ////console.log(this.vel);
        this.local_transform.translate(translation);
        dirty = true;
        super.update(elapsed, dirty);
    }
}