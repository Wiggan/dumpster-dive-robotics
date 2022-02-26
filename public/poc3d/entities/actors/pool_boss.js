'use strict'

class PoolBoss extends Actor {
    constructor(parent, position) {
        super(null, position); 
        this.scene = parent;
        this.position = position;
        this.type = PickableType.Enemy;
        this.base = new Drawable(this, [0, 0, 0], models.pool_boss.base);
        this.local_transform.yaw(-90);
        this.wheels = new Drawable(this, [0, 0, 0], models.pool_boss.wheels);
        this.cleaner = new Drawable(this, [0, 0, 0], models.pool_boss.cleaner);
        this.launcher = new Launcher(this);
        this.launcher.local_transform.yaw(-90);
        this.launcher.local_transform.roll(-90);
        this.launcher.local_transform.scaleUniform(3);

        this.base.material = materials.metall;
        this.wheels.material = materials.rubber;
        this.cleaner.material = materials.rubber;

        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.8, 0.4);
        this.stats = {
            movement_speed: 0.003,
            acceleration: 0.00001,
            dmg: 1,
            dmg_cooldown: 3000,
            patrol_tolerance: 0.5
        };
        this.strategy = new BossStrategy(this);
        this.blinking_drawables_on_damage = [this.base, this.wheels, this.cleaner];
        this.attack_done = true;
    }
    
    toJSON(key) {
        return {
            class: 'PoolBoss',
            strategy: this.strategy,
            local_position: this.position,
        }
    }

    goto(position) {
        // Lazy load  
        if (!this.collisionGrid) {
            this.collisionGrid = this.scene.getCollisionGrid();
        
            this.pathFinder = new EasyStar.js();
            this.pathFinder.setGrid(this.collisionGrid.grid);
            this.pathFinder.setAcceptableTiles([undefined]);
            this.pathFinder.enableSync();
            //this.pathFinder.enableDiagonals();
            this.target_position;
        }
        var x1 = snapToGrid(this.getWorldPosition())[0] - this.collisionGrid.offsetX;
        var x2 = snapToGrid(position)[0] - this.collisionGrid.offsetX;
        var y1 = snapToGrid(this.getWorldPosition())[2] - this.collisionGrid.offsetY;
        var y2 = snapToGrid(position)[2] - this.collisionGrid.offsetY;
        this.pathFinder.findPath(x1, y1, x2, y2, (path => {
            if (path === null || path.length == 0) {
                console.log("No path to position:" + JSON.stringify(position) + " current_position: " + this.getWorldPosition());
            } else {
                this.path = path;
                this.path_index = 0;
                this.setTargetPoint(path[0]);
            }
        }));
        this.pathFinder.calculate();

    }

    attack(position) {
        this.launcher.lookAtInstantly(position);
        this.launcher.fire();
        this.attack_done = true;
    }

    gridToWorld(point2d) {
        return [point2d.x + this.collisionGrid.offsetX, 0, point2d.y + this.collisionGrid.offsetY];
    }

    setTargetPoint(point2d) {
        this.target_position = point2d;
        this.world_target_position = [point2d.x + this.collisionGrid.offsetX, 0, point2d.y + this.collisionGrid.offsetY];
        
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

        // Limit velocities
        this.velocity[0] = 0;//Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[0]));
        this.velocity[2] = Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[2]));

        if (this.path) {
            if (vec3.dist(this.world_target_position, this.getWorldPosition()) < this.stats.patrol_tolerance) {
                this.path_index++;
                if (!this.path[this.path_index]) {
                    console.log("Reached end of path");
                    this.path = undefined;
                    this.world_target_position = undefined;
                } else {
                    this.setTargetPoint(this.path[this.path_index]);
                }
            }
        }
        dirty |= this.strategy.update(elapsed);
        this.cleaner.local_transform.yaw(1.8*elapsed);
        this.wheels.local_transform.yaw(1.8*elapsed*this.velocity[2]);

        super.update(elapsed, dirty);
    }

    draw(renderer) {
        if(debug && this.path) {
            this.path.forEach(point => {
                debugDraw(renderer, this.gridToWorld(point));
            });
        }
        super.draw(renderer);
    }

    takeDamage(amount, instigator, collider) {
        super.takeDamage(amount, instigator, collider);
        // Todo drop a propeller for each hit and become slower?
    }

    onDeath() {
        super.onDeath();
        player.slain_bosses.push(this.class);
        this.scene.getAllOfClass('Portal').forEach(portal => {
            portal.enable();
        });
        playMusic(music.in_game);
        new HeadLampPowerUp(snapToGrid(this.getWorldPosition()));
    }
}


classes.PoolBoss = PoolBoss;