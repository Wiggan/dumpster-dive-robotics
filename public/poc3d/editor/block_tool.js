'use strict'

class BlockTool extends Tool {
    constructor() {
        super();
        this.blocks = [new Block(this, [0,0,0]),
                       new Background(null, [0,0,0]),
                       new WaterSurface(null, [0,0,0]),
                       new Portal(null, [0,0,0]),
                       new Door(null, [0,0,0]),
                       new LightSensor(null, [0,0,0]),
                       new ChargeTrigger(null, [0,0,0]),
                       new CeilingCannon(null, [0,0,0]),
                       new SaveStation(null, [0,0,0]),
                       new CrackingBlock(null, [0,0,0]),
                       new FlameThrower(null, [0,0,0]),
                       new Goal(null, [0,0,0]),
                    ];
        this.blocks.forEach(block => block.material = materials.blue);
        this.block_index = 0;
        this.previousDrawingPosition = [0, 0, 0];
    }

    onKeyDown(e) {
        super.onKeyDown(e);
        if (e.key == 'ArrowUp') {
            this.changeBlock(1);
        } else if (e.key == 'ArrowDown') {
            this.changeBlock(-1);
        }
    }
    
    onKeyUp(e) {
        super.onKeyUp(e);
    }

    onmousedown(e, clicked_entity) {
        super.onmousedown(e, clicked_entity);
        if (e.button == 0 && !e.altKey) {
            this.drawing = true;
        } else if (e.button == 2) {
            this.rubbering = true;
        }
    }
    
    onmouseup(e, clicked_entity) {
        super.onmouseup(e, clicked_entity);
        
        if (e.button == 0) {
            var blockInPosition = this.getBlockInPosition(this.getWorldPosition());
            if (e.altKey) {
                //clicked_entity // Fix "color picking"
                if (blockInPosition) {
                    var block_index = this.blocks.findIndex(block => block.toJSON().class == blockInPosition.toJSON().class);
                    if (block_index != -1) {
                        console.log("Picked " + block_index + " " + blockInPosition.toJSON().class);
                        this.setBlock(block_index);
                    }
                }
            } else {
                this.drawing = false;
            }
        } else if (e.button == 2) {
            this.rubbering = false;
        }
    }

    draw(renderer) {
        if (alt_pressed) {
            var selected_entity = pickable_map.get(selected_id);
            if (selected_entity) {
                renderer.add_textbox({pos: this.getWorldPosition(), text: selected_entity.toJSON().class});
            }
        } else {
            super.draw(renderer);
            renderer.add_textbox({pos: this.getWorldPosition(), text: this.blocks[this.block_index].toJSON().class});
        }
    }


    setBlock(block_index) { 
        this.block_index = block_index;
        this.removeAllChildren();
        this.addChild(this.blocks[this.block_index]);
    }

    changeBlock(delta) {
        var block_index = (this.block_index + delta) % this.blocks.length;
        if (block_index < 0) block_index += this.blocks.length;
        this.setBlock(block_index);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        if (alt_pressed) {
            this.setPicking(true); 
        } else {
            this.setPicking(false);
        }
        if (this.drawing) {
            if (vec3.dist(this.previousDrawingPosition, this.getWorldPosition()) > 0.01) {
                this.placeBlockInScene(this.blocks[this.block_index].toJSON().class, this.getWorldPosition());
                this.previousDrawingPosition = this.getWorldPosition();
            }
        } else if (this.rubbering) {
            var blockInPosition = this.getBlockInPosition(this.getWorldPosition());
            if (blockInPosition) {
                game.scene.remove(blockInPosition);
            }
        }
    }
}