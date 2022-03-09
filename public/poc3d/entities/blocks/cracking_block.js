'use strict';

class CrackingBlock extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position, false, 1, 0.2);
        this.local_position = local_position;
        this.background = new Background(this, [0, 0, 0]);
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Level, 1, 1);
        this.cell_holder = new Entity(this, [0, 0, 0]);
        this.cell_holder.local_transform.yaw(Math.floor(Math.random()*4)*90);
        this.cell_holder.local_transform.roll(Math.floor(Math.random()*4)*90);
        this.cell_holder.local_transform.pitch(Math.floor(Math.random()*4)*90);
        this.cells = [];
        models.cracking_block.forEach(cell => {
            var cell = new Drawable(this.cell_holder, [0, 0, 0], cell);
            cell.material = materials.wall;
            cell.time_offset = Math.random() * 2000;
            this.cells.push(cell);
        });
        this.elapsed = 0;
        this.target_position = [0, -0.1, 2];
        this.duration = 3000;
    }

    start_triggering() {
        this.triggered = true;
    }
    stop_triggering() {}

    toJSON(key) {
        return {
            class: 'CrackingBlock',
            uuid: this.uuid,
            local_position: this.local_position
        }
    }

    update(elapsed, dirty) {
        if (this.triggered) {
            this.elapsed += elapsed;
            this.cells.forEach(cell => {
                var pos = vec3.create();
                var t = Math.min(1.0, Math.max(0, this.elapsed - cell.time_offset)/this.duration)**4;
                vec3.lerp(pos, [0, 0, 0], this.target_position, t);
                cell.local_transform.setPosition(pos);
            });
            if (this.elapsed > this.duration) {
                this.collider.type = CollisionLayer.Sensor;
                //this.cells.length = 0;
            }
        }
        super.update(elapsed, dirty);
    }
} 


classes.CrackingBlock = CrackingBlock;