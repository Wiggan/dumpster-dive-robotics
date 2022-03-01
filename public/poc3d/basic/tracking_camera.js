'use strict'

class TrackingCamera extends Camera {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_transform.pitch(-90);
        this.x = 10;
        this.y = 10;
        this.pointing_at = vec3.create();
        this.update(0, true);
        var fwd = forward(this.getWorldTransform());
        var upp = up(this.getWorldTransform());
        Howler.orientation(fwd[0], fwd[1], fwd[2], upp[0], upp[1], upp[2]);
        this.independent = true;
        this.position = undefined;
    }

    activate() {
        super.activate();
        document.addEventListener("mousemove", active_camera.updatePosition, false);
    }
    
    deactivate() {
        document.removeEventListener("mousemove", active_camera.updatePosition, false);
    }

    updatePosition(e) {
        active_camera.x = e.clientX;
        active_camera.y = e.clientY;
    }

    onKeyDown(e) {
        super.onKeyDown(e);
        if (e.key == 'Control') {
            e.preventDefault();
        } else if (e.key == 'Shift') {
            player.dash();
        } else if (e.key == 'w' || e.key == 'W') {
            player.startVerticalMovement(true);
        } else if (e.key == 's' || e.key == 'S') {
            player.startVerticalMovement(false);
        } else if ((e.key == 'a' || e.key == 'A') && !e.repeat) {
            player.startMovement(false);
        } else if ((e.key == 'd' || e.key == 'D') && !e.repeat) {
            player.startMovement(true);
        } else if (e.key == ' ' && !e.repeat) {
            player.jump();
        } else if (e.key == 'Escape') {
            toggleMenuVisible();
        } else if (e.key == 'm') {
            player.pickUp(items.disk);
        } else if (e.key == 'l') {
            player.pickUp(items.lamp);
        } else if (e.key == 'b') {
            player.pickUp(items.battery);
        } else if (e.key == 'u') {
            player.pickUp(items.suction_device);
        }
    }

    onKeyUp(e) {
        if (e.key == 'w' || e.key == 'W') {
            player.endVerticalMovement(true);
        } else if (e.key == 's' || e.key == 'S') {
            player.endVerticalMovement(false);
        } else if (e.key == 'a' || e.key == 'A') {
            player.endMovement(false);
        } else if (e.key == 'd' || e.key == 'D') {
            player.endMovement(true);
        }
    }

    onmousedown(e) {
        if (e.button == 0) {
            player.left_click(this.pointing_at, pickable_map.get(selected_id));
        } else if (e.button == 2) {
            player.right_click(this.pointing_at, pickable_map.get(selected_id));
        }
        e.preventDefault();
    }
    onmouseup(e) {
        e.preventDefault();
    } 

    onclick(e) {
        e.preventDefault();
    }

    update(elapsed, dirty) {
        if (this.position) {
            // Scripting / override normal behavior
            this.local_transform.setPosition(this.position);
        } else {
            var new_pos = this.parent.getWorldPosition();
            new_pos[1] += 16;
            if (game.scene) {
                game.scene.camera_anchors.forEach((anchor) => {
                    var t = 1.0/(1.0 + (anchor.getSquaredHorizontalDistanceToPlayer() / anchor.force));
                    //console.log("t: " + t)
                    vec3.lerp(new_pos, new_pos, anchor.getWorldPosition(), t);
                });
            }
    
            //new_pos[1] = new_pos[1]*1024/gl.canvas.width;
            this.local_transform.setPosition(new_pos);
        }
        var p1 = getScreenSpaceToWorldLocation([this.x, this.y, 0]);
        var p2 = getScreenSpaceToWorldLocation([this.x, this.y, 100]);
        var intersection = getHorizontalIntersection(p1, p2, 0);
        if (Number.isFinite(intersection[0]) && Number.isFinite(intersection[1]) && Number.isFinite(intersection[2])) {
            this.pointing_at = intersection;
            dirty = true;
        }
        super.update(elapsed, dirty);
        var pos = this.getWorldPosition();
        Howler.pos(pos[0], pos[1], pos[2]);
    }

    draw(renderer) {
        if (debug) {
            var world_transform = mat4.create();
            mat4.fromTranslation(world_transform, this.pointing_at);
            renderer.add_drawable(models.box, materials.light, world_transform);
        }
    }
}