'use strict'

class WaterBoss extends Actor {
    constructor(parent, position) {
        super(null, position);
        this.scene = parent;
        this.local_position = position;
        this.type = PickableType.Enemy;
        this.base = new Drawable(this, [0, 0, 0.505], models.water_boss.base);
        this.propeller = new Drawable(this.base, [0, 0, 0], models.water_boss.propeller);
        
        this.launcher = new Launcher(this);
        this.launcher.launch_point.local_transform.setPosition([0.33, 0, 0]);
        this.launcher.drawable.model = models.water_boss.launcher;
        this.launcher.lamp.local_transform.setPosition([0.3, 0.3, 0]);
        this.launcher.lamp.local_transform.scale([0.015, 0.18, 0.015]);
        
        this.propeller.material = materials.rubber;
        this.base.material = materials.metall;
        
        this.collider = new Collider(this, [0, 0, 0], CollisionLayer.Enemy, 0.6, 0.6);
        this.stats = {
            jump_speed: 0.02,
            movement_speed: 0.004,
            acceleration: 0.000012,
            dmg: 0,
            dmg_cooldown: 3000,
            patrol_tolerance: 0.1
        };
        this.strategy = new BossStrategy(this, [0.3, 0.3]);
        this.blinking_drawables_on_damage = [this.base, this.propeller, this.launcher.drawable];
        this.attack_done = true;
    }
    
    toJSON(key) {
        return {
            class: 'WaterBoss',
            strategy: this.strategy,
            local_position: this.local_position,
        }
    }

    goto(position) {
        console.log("Patroling");
/*         if (vec3.dist(position, this.getWorldPosition() < 1)) {
            return;
        } */
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
                console.log("No path to position")
            } else {
                this.path = path;
                this.path_index = 0;
                this.setTargetPoint(path[0]);
            }
        }));
        this.pathFinder.calculate();

    }

    attack(position) {
        console.log("Attacking");
        this.attack_done = false;
        new SFX(this, [0, 0, 0], sfx.attack);
        if (Math.random() < 0.5) {
            this.velocity[2] = -this.stats.jump_speed * (1 - Math.random()*0.4);
            var position = [0, 0, 0.45];
            new Dirt(this, position, [0, 0, -1], 10, 0.4);
            window.setTimeout(() => {
                this.attack_done = true;
                console.log("Attacking done");
            }, 1000);
        } else {
            var up = this.getWorldPosition();
            up[2] -= 1;
            this.launcher.lookAtInstantly(up);
            new HomingRocket(this.launcher.launch_point.getWorldPosition(), this, player);
            new HomingRocket(this.launcher.launch_point.getWorldPosition(), this, player);
            window.setTimeout(() => {
                this.attack_done = true;
                console.log("Attacking done");
            }, 500);
        }
    }

    gridToWorld(point2d) {
        return [point2d.x + this.collisionGrid.offsetX, 0, point2d.y + this.collisionGrid.offsetY];
    }

    setTargetPoint(point2d) {
        this.target_position = point2d;
        this.world_target_position = [point2d.x + this.collisionGrid.offsetX, 0, point2d.y + this.collisionGrid.offsetY];
        
    }

    update(elapsed, dirty) {

        this.propeller.local_transform.roll(elapsed * vec3.length(this.velocity) * 1000);

        var direction = this.base.getWorldPosition();
        if (this.velocity[0] > 0.00001) {
            vec3.add(direction, direction, [0.1, 0, -1]);
            this.base.look_at = direction;
        } else if (this.velocity[0] < -0.00001) {
            vec3.add(direction, direction, [0.1, 0, 1]);
            this.base.look_at = direction;
        } else {
            vec3.add(direction, direction, [1, 0, 0]);
            this.base.look_at = direction;
        }

        if (this.world_target_position) {
            var direction = vec3.create();
            vec3.subtract(direction, this.world_target_position, this.getWorldPosition());
            vec3.normalize(direction, direction);
            vec3.scale(this.force, direction, this.stats.acceleration);
        }
        if (this.getWorldPosition()[2] < 0) {
            this.force[2] = constants.gravity;
        } else if (1 > this.getWorldPosition()[2] && this.getWorldPosition()[2] > 0) {
            this.force[2] = constants.gravity * 0.5;
        } else {
            this.force[2] = 0;
            this.local_transform.setPosition([this.getWorldPosition()[0], 0, 1]);
        }

        // Accelerate
        var at = vec3.create();
        vec3.scale(at, this.force, elapsed);
        vec3.add(this.velocity, this.velocity, at);

        // Limit velocities
        this.velocity[0] = Math.min(this.stats.movement_speed, Math.max(-this.stats.movement_speed, this.velocity[0]));
        this.velocity[2] = Math.min(this.stats.jump_speed, Math.max(-this.stats.jump_speed, this.velocity[2]));


        if (!this.attack_done && this.velocity[2] > 0.00001) {
            this.launcher.lookAtInstantly(player.getWorldPosition());
            this.launcher.fire();
        }

        if (this.path) {
            var dist = vec3.dist(this.world_target_position, this.getWorldPosition());
            if (dist < this.stats.patrol_tolerance) {
                this.path_index++;
                if (!this.path[this.path_index]) {
                    console.log("Reached end of path");
                    this.path = undefined;
                    this.world_target_position = undefined;
                    this.force = [0, 0, 0];
                    this.velocity = [0, 0, 0];
                } else {
                    this.setTargetPoint(this.path[this.path_index]);
                }
            }
        }
        dirty |= this.strategy.update(elapsed);

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
    }

    onDeath() {
        super.onDeath();
        player.slain_bosses.push(this.class);
        this.scene.getAllOfClass('Portal').forEach(portal => {
            portal.enable();
        });
        playMusic(music.in_game);
        new CounterPressurizerPowerUp(snapToGrid(this.getWorldPosition()));
    }
}


classes.WaterBoss = WaterBoss;