'use strict'

class TrackingCamera extends Camera {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.local_transform.pitch(-60);
        this.x = 10;
        this.y = 10;
        this.pointing_at = vec3.create();
        this.update(0, true);
        var fwd = forward(this.getWorldTransform());
        var upp = up(this.getWorldTransform());
        Howler.orientation(fwd[0], fwd[1], fwd[2], upp[0], upp[1], upp[2]);
    }

    activate() {
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
        if (e.key == 'i' || e.key == 'I') {
            show_inventory = !show_inventory;
        } else if (e.key == 'l') {
            new Loot(player.getWorldPosition(), drop_consumable({max_drop: 5, level:10}));
            e.preventDefault();
        } else if (e.key == 'Alt') {
            alt_pressed = true;
            e.preventDefault();
        } else if (e.key == 'Control') {
            ctrl_pressed = true;
            e.preventDefault();
        } else if (e.key == 'Escape') {
            toggleMenuVisible();
        }
    }

    onKeyUp(e) {
        if (e.key == 'Alt') {
            alt_pressed = false;
            e.preventDefault();
        } else if (e.key == 'Control') {
            ctrl_pressed = false;
            e.preventDefault();
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
    
            renderer.add_drawable(models.sphere, materials.light, world_transform);
        }
    }
}