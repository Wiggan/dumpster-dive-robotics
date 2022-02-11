class Skill {
    constructor({x, y, name, description, effect, amount}) {
        this.position = {x, y};
        this.name = name;
        this.description = description;
        this.effect = effect;
    }
}

class Projectile extends Drawable {
    constructor({instigator, position, direction, sprites}) {
        super(position);
        this.instigator = instigator;
        this.direction = direction;
        this.speed = 100;
        this.sprites = sprites;
        this.rotate = true;
    }    
    
    update(elapsed) {
        super.update(elapsed);
        this.position.x += this.speed * elapsed * this.direction.x;
        this.position.y += this.speed * elapsed * this.direction.y;
    }
    

}

const fireball_effect = ({instigator, target_position}) => {
    const dir = direction(instigator.position, target_position);
    var projectile = new Projectile({instigator: instigator, position: { ...instigator.position }, direction: dir, sprites: fireball_images});
    projectile.brightness = 3;
    projectile.shadow_radius = 0;
    world.projectiles.push(projectile);
};
const fireball = (x, y) => (new Skill({x: x, y: y, name: "Fireball", description: "Shoots fireballs", effect: fireball_effect}));