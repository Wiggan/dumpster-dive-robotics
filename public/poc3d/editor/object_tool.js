'use strict'

class ObjectTool extends Tool {
    constructor() {
        super();
        this.objects = [
            new VacuumFan(null, [0, 0, 0]),
            new VacuumTableFan(null, [0, 0, 0]),
            new VacuumToaster(null, [0, 0, 0]),
            new Drone(null, [0, 0, 0]),
            new DroneLamp(null, [0, 0, 0]),
            new DroneToaster(null, [0, 0, 0]),
            new CameraAnchor(null, [0, 10, 0]),
            new Light(null, [0, 0, 0]),
            new DiskPowerUp(null, [0, 0, 0]),
            new PlatePowerUp(null, [0, 0, 0]),
            new GoldNugget(null, [0, 0, 0]),
            new FlimmeringLight(null, [0, 0, 0]),
            new LampBoss(null, [0, 0, 0]),
            new PoolBoss(null, [0, 0, 0]),
            new WaterBoss(null, [0, 0, 0]),
            new BatteryBoss(null, [0, 0, 0]),
        ];
        this.objects.forEach(object => object.material = materials.blue);
        this.object_index = 0;
        this.setObject(this.object_index);
    }

    onKeyDown(e) {
        super.onKeyDown(e);
        if (e.key == 'ArrowUp') {
            this.changeObject(1);
        } else if (e.key == 'ArrowDown') {
            this.changeObject(-1);
        }
    }
    
    onKeyUp(e) {
        super.onKeyUp(e);
    }

    onmousedown(e, clicked_entity) {
        super.onmousedown(e, clicked_entity);
    }
    
    onmouseup(e, clicked_entity) {
        super.onmouseup(e, clicked_entity);
        
        if (e.button == 0) {
            if (e.altKey) {
                //clicked_entity // Fix "color picking"
                if (clicked_entity) {
                    var object_index = this.objects.findIndex(object => object.toJSON().class == clicked_entity.toJSON().class);
                    if (object_index != -1) {
                        console.log("Picked " + object_index + " " + clicked_entity.class);
                        this.setObject(object_index);
                    }
                }
            } else {
                this.placeObjectInScene(this.objects[this.object_index].toJSON().class, this.objects[this.object_index].getWorldPosition());
            }
        }
    }

    placeObjectInScene(class_name, position) {
        var new_entity = new classes[class_name](game.scene, position);    
        if (!new_entity.id) {
            new_entity.makePickable();
        }
        game.scene.entities.push(new_entity);
    }

    draw(renderer) {
        if (alt_pressed) {
            var selected_entity = pickable_map.get(selected_id);
            if (selected_entity) {
                renderer.add_textbox({pos: this.getWorldPosition(), text: selected_entity.toJSON().class});
            }
        } else {
            super.draw(renderer);
            renderer.add_textbox({pos: this.getWorldPosition(), text: this.objects[this.object_index].toJSON().class});
        }
    }

    setObject(object_index) { 
        this.object_index = object_index;
        this.removeAllChildren();
        this.addChild(this.objects[this.object_index]);
    }

    changeObject(delta) {
        var object_index = (this.object_index + delta) % this.objects.length;
        if (object_index < 0) object_index += this.objects.length;
        this.setObject(object_index);
    }

    setPosition(position) {
        this.local_transform.setPosition(position);
        this.update(0, true);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        if (alt_pressed) {
            this.setPicking(true); 
        } else {
            this.setPicking(false);
        }
    }
}