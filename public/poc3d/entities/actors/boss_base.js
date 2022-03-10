
class BossBase extends Actor {
    constructor(parent, position, powerup) {
        super(null, position); 
        this.scene = parent;
        this.local_position = position;
        this.type = PickableType.Enemy;

        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.8, 0.8);
        this.stats = {
            movement_speed: 0.003,
            vertical_movement_speed: 0,
            acceleration: 0.00001,
            dmg: 1,
            dmg_cooldown: 3000,
            patrol_tolerance: 0.5
        };
        this.strategy = new BossStrategy(this);
        this.blinking_drawables_on_damage = [];
        this.attack_done = true;
        this.powerup = powerup;
    }

    goto(position) {
        // Lazy load  
        if (!this.collisionGrid) {
            this.collisionGrid = this.scene.getCollisionGrid();
        
            this.pathFinder = new EasyStar.js();
            this.pathFinder.setGrid(this.collisionGrid.grid);
            this.pathFinder.setAcceptableTiles([undefined]);
            this.pathFinder.enableSync();
        }
        var x1 = snapToGrid(this.getWorldPosition())[0] - this.collisionGrid.offsetX;
        var x2 = snapToGrid(position)[0] - this.collisionGrid.offsetX;
        var y1 = snapToGrid(this.getWorldPosition())[2] - this.collisionGrid.offsetY;
        var y2 = snapToGrid(position)[2] - this.collisionGrid.offsetY;
        this.pathFinder.findPath(x1, y1, x2, y2, (path => {
            if (path === null || path.length == 0) {
                console.log("No path to position")
            } else {
                this.path = path.map(point2d => {
                    return [point2d.x + this.collisionGrid.offsetX, 0, point2d.y + this.collisionGrid.offsetY];
                });
                this.path_index = 0;
                this.world_target_position = this.path[this.path_index];
            }
        }));
        this.pathFinder.calculate();
    }

    draw(renderer) {
        if(debug && this.path) {
            this.path.forEach(point => {
                debugDraw(renderer, point);
            });
        }
        super.draw(renderer);
    }

    onDeath() {
        super.onDeath();
        player.slain_bosses.push(this.class);
        this.scene.getAllOfClass('Portal').forEach(portal => {
            portal.enable();
        });
        playMusic(music.in_game);
        (new this.powerup(snapToGrid(this.getWorldPosition()))).player_position = vec3.clone(player.getWorldPosition());
    } 

    update(elapsed, dirty) {

        if (this.world_target_position) {
            var direction = vec3.create();
            vec3.subtract(direction, this.world_target_position, this.getWorldPosition());
            vec3.normalize(direction, direction);
            vec3.scale(this.force, direction, this.stats.acceleration);
        }

        // Accelerate
        var at = vec3.create();
        vec3.scale(at, this.force, elapsed);
        vec3.add(this.velocity, this.velocity, at);

        if (this.path) {
            if (vec3.dist(this.world_target_position, this.getWorldPosition()) < this.stats.patrol_tolerance) {
                this.path_index++;
                if (!this.path[this.path_index]) {
                    console.log("Reached end of path");
                    this.path = undefined;
                    this.world_target_position = undefined;
                    this.velocity = [0, 0, 0];
                    this.force = [0, 0, 0];
                } else {
                    this.world_target_position = this.path[this.path_index];
                }
            }
        }
        dirty |= this.strategy.update(elapsed);

        // Limit velocities
        this.velocity[0] = Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[0]));
        this.velocity[2] = Math.min(this.stats.vertical_movement_speed, Math.max(-this.stats.vertical_movement_speed, this.velocity[2]));

        super.update(elapsed, dirty);
    }
}