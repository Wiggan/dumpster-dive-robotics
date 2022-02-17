'use strict'

class ParticleSystem extends Entity {
    constructor(parent, local_position) {
        super(parent, local_position);
        this.direction = [0, 1, 0];
        this.continuous = true;
        this.spread = 0.5;
        this.min_speed = 0.001;
        this.max_speed = 0.005;
        this.particle_life_time = 400;
        this.start_randomly = true;
        this.ended_callback = undefined;
        this.start = {color: [1.0, 0.0, 0.0], scale: 0.1};
        this.stop = {color: [1.0, 0.6, 0.0], scale: 0};
    }
    

    toJSON(key) {
        return {
        };
    }

    setParticleCount(count) {
        var lookat = vec3.clone(this.direction);
        vec3.scale(lookat, lookat, -1);
        vec3.add(lookat, lookat, this.getWorldPosition());
        this.lookAtInstantly(lookat);
        this.particle_count = count;
        this.children.length = 0;
        for (var i = 0; i < this.particle_count; i++) {
            new Particle(this, this.getWorldPosition());
        }
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
    }

    draw(renderer) {
        if (debug) {    
            renderer.add_drawable(models.box, materials.light, this.getWorldTransform());
        }
        super.draw(renderer);
    }
}

class Particle extends Drawable {
    constructor(parent, local_position) {
        super(parent, local_position, models.box);
        this.independent = true;
        this.original_position = local_position;
        this.material = {
            ambient: [1.0, 1.0, 1.0],
            specular: [1.0, 1.0, 1.0],
            diffuse: vec3.clone(this.parent.start.color),
            shininess: 1,
            isLight: true
        }
        this.reset();
        
        if (parent.start_randomly) {
            this.elapsed = Math.random()*this.life_time;
        } else {
            this.elapsed = 0;
        }
    }
    
    reset() {
        this.life_time = this.parent.particle_life_time + Math.random()*200;
        this.velocity = vec3.clone(right(this.parent.getWorldTransform()));
        vec3.scale(this.velocity, this.velocity, -1);
        vec3.rotateX(this.velocity, this.velocity, [0, 0, 0], (Math.random()-0.5)*this.parent.spread*Math.PI*2);
        vec3.rotateY(this.velocity, this.velocity, [0, 0, 0], (Math.random()-0.5)*this.parent.spread*Math.PI*2);
        vec3.rotateZ(this.velocity, this.velocity, [0, 0, 0], (Math.random()-0.5)*this.parent.spread*Math.PI*2);
        vec3.scale(this.velocity, this.velocity, this.parent.min_speed + Math.random()*(this.parent.max_speed-this.parent.min_speed));
        this.scale = this.parent.start.scale;
        this.local_transform.setPosition(this.parent.getWorldPosition());
        this.elapsed = 0;
        this.material.diffuse = vec3.clone(this.parent.start.color);
    }

    update(elapsed, dirty) {
        if (this.elapsed > this.life_time) {
            if (this.parent.continuous) {
                this.reset();
            } else {
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }
        }
        this.elapsed += elapsed;
        var t = this.elapsed/this.life_time;
        vec3.lerp(this.material.diffuse, this.parent.start.color, this.parent.stop.color, t);
        this.local_transform.scaleUniform(this.parent.start.scale + t * (this.parent.stop.scale - this.parent.start.scale));
        var translation = vec3.clone(this.velocity);
        vec3.scale(translation, translation, elapsed);
        this.local_transform.translate(translation);
        super.update(elapsed, true);
    }
}