'use strict'

class EditorCamera extends Camera {
    constructor(local_position) {
        super(null, local_position);
        this.original_position = local_position;
        this.local_transform.pitch(-90);
        this.x = 10;
        this.y = 10;
        this.velocity = [0, 0, 0];
        this.wheel = 0;
        this.light = new PointLight(this, [0, 0, 2]);
        this.light.active = true;
        this.light.ambient = [1, 1, 1];
        this.light.linear = 0.035;
        this.light.quadratic = 0.09;

        this.tools = [
            new SelectionTool(),
            new BlockTool(),
            new ObjectTool()
        ]
        this.active_tool = this.tools[0];
        this.undo_stack = new Stack(10);
    }

    toJSON(key) { 
        return {}; 
    }

    pushToUndoStackIfNeeded(original_json, new_json) {
        if (original_json != new_json) {
            this.undo_stack.push(original_json);
        }
    }

    undo() {
        if (!this.undo_stack.isEmpty()) {
            var previous = JSON.parse(this.undo_stack.pop());
            game.scene = new Scene(previous.name, previous.entities);
        }
    }

    activate() {
        super.activate();
        document.addEventListener("mousemove", active_camera.updatePosition, false);
        document.addEventListener("wheel", active_camera.updateScroll, false);
    
        if (player) {
            for (const [key, value] of Object.entries(game.scenes)) {
                game.scenes[key].remove(player);
            }
            cameras.splice(cameras.lastIndexOf(player.camera), 1);
            player = undefined;
            gui.removeFolder(gui.player);
        }
    }
    
    deactivate() {
        document.removeEventListener("mousemove", active_camera.updatePosition, false);
        document.removeEventListener("wheel", active_camera.updateScroll, false);
    }

    updatePosition(e) {
        active_camera.x = e.clientX;
        active_camera.y = e.clientY;
    }

    updateScroll(e) {
        active_camera.local_transform.translate([0, -e.wheelDeltaY/100, 0]);
        return false;
    }

    onKeyDown(e) {
        super.onKeyDown(e);
        if (e.key == 'Alt') {
            alt_pressed = true;
            e.preventDefault();
        } else if (e.key == 'Control') {
            ctrl_pressed = true;
            e.preventDefault();
        } else if (e.key == 'w' || e.key == 'W') {
            this.velocity[2] = -0.005;
        } else if (e.key == 's' || e.key == 'S') {
            this.velocity[2] = 0.005;
        } else if ((e.key == 'a' || e.key == 'A') && !e.shiftKey) {
            this.velocity[0] = -0.005;
        } else if (e.key == 'd' || e.key == 'D') {
            this.velocity[0] = 0.005;
        } else if (e.key == ' ') {
            this.local_transform.setPosition(this.original_position);
        } else if (e.key == '1') {
            this.active_tool = this.tools[0];
        } else if (e.key == '2') {
            this.active_tool = this.tools[1];
        } else if (e.key == '3') {
            this.active_tool = this.tools[2];
        } else if (e.key == 'z' && e.ctrlKey) {
            this.undo();
        } else if (e.key == 'p') {
            game.placePlayer(this.active_tool.getWorldPosition());
            player.camera.activate();
            
            gui.player = gui.addFolder('Player');
            gui.player.add(player.stats, 'movement_speed', 0.0001, 0.1, 0.000001);
            gui.player.add(player.stats, 'acceleration', 0.0001, 0.1, 0.000001);
            gui.player.add(player.stats, 'jump_speed', 0.00001, 0.1, 0.000001);
            gui.player.add(constants, 'gravity', 0, 0.0001, 0.000001);
            gui.player.add(constants, 'dash_timing', 50, 500, 10);
            gui.player.add(constants, 'dash_duration', 100, 2000, 100);
            gui.player.add(constants, 'dash_cooldown', 100, 2000, 100);
            gui.player.open();

            game.paused = false;
        }
        var original_json = JSON.stringify(game.scene);
        this.active_tool.onKeyDown(e);
        this.pushToUndoStackIfNeeded(original_json, JSON.stringify(game.scene));
    }

    onKeyUp(e) {
        if (e.key == 'Alt') {
            alt_pressed = false;
            e.preventDefault();
        } else if (e.key == 'Control') {
            ctrl_pressed = false;
            e.preventDefault();
        } else if (e.key == 'w' || e.key == 'W') {
            this.velocity[2] = 0;
        } else if (e.key == 's' || e.key == 'S') {
            this.velocity[2] = 0;
        } else if (e.key == 'a' || e.key == 'A') {
            this.velocity[0] = 0;
        } else if (e.key == 'd' || e.key == 'D') {
            this.velocity[0] = 0;
        }
        var original_json = JSON.stringify(game.scene);
        this.active_tool.onKeyUp(e);
        this.pushToUndoStackIfNeeded(original_json, JSON.stringify(game.scene));
    }

    onmousedown(e) {
        var original_json = JSON.stringify(game.scene);
        this.active_tool.onmousedown(e, pickable_map.get(selected_id));
        this.pushToUndoStackIfNeeded(original_json, JSON.stringify(game.scene));
        e.preventDefault();
    }

    onmouseup(e) {
        var original_json = JSON.stringify(game.scene);
        this.active_tool.onmouseup(e, pickable_map.get(selected_id));
        this.pushToUndoStackIfNeeded(original_json, JSON.stringify(game.scene));

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
            this.active_tool.setPosition(intersection);
        }
        this.active_tool.update(elapsed, dirty);
        super.update(elapsed, dirty);
    }

    draw(renderer) {
        this.active_tool.draw(renderer);
        if (debug) {
            renderer.add_drawable(models.box, materials.light, this.active_tool.getWorldTransform());
        }
    }
}

class Stack {
    constructor(maxSize) { // Set default max size if not provided
       if (isNaN(maxSize)) {
          maxSize = 10;
       }
       this.maxSize = maxSize; // Init an array that'll contain the stack values.
       this.container = [];
    }
    display() {
       console.log(this.container);
    }
    isEmpty() {
       return this.container.length === 0;
    }
    isFull() {
       return this.container.length >= this.maxSize;
    }
    push(element) { // Check if stack is full
       if (this.isFull()) {
        this.container.shift();
       }
       this.container.push(element);
    }
    pop() { // Check if empty
       if (this.isEmpty()) {
          console.log("Stack Underflow!"); 
          return;
       }
       return this.container.pop();
    }
    peek() {
       if (isEmpty()) {
          console.log("Stack Underflow!");
          return;
       }
       return this.container[this.container.length - 1];
    }
    clear() {
       this.container = [];
    }
 }