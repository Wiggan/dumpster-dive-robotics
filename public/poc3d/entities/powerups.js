'use strict'

class PowerUp extends Pickable {
    constructor(position, item, model, material) {
        super(null, position);
        this.local_position = position;
        this.original_position = vec3.clone(position);
        this.drawable = new Drawable(this, [0, 0, 0], model);
        this.drawable.material = material;
        this.drawable.id = this.id;
        this.particles = new PowerUpParticles(this, [0, 0 ,0]);
        this.item = item;
        this.label = this.item.name;
        this.elapsed = 0;
        this.move_towards_player = false;
    }

    interact() {
        player.pickUp(this);
        new SFX(this, [0, 0, 0], sfx.pickup);
        game.scene.remove(this);
    }

    toJSON(key) {
        return '';
    }


    update(elapsed, dirty) {
        this.elapsed += elapsed;
        var pos = vec3.create();
        if (this.move_towards_player && vec3.dist(this.getWorldPosition(), this.player_position) > 0.1) {
            vec3.lerp(pos, this.original_position, this.player_position, Math.min(0.8, this.elapsed/10000));
        } else if (this.move_towards_player) {
            this.local_position = this.getWorldPosition();
            this.move_towards_player = false;
        } else {
            vec3.copy(pos, this.local_position);
        }

        vec3.add(pos, pos, [0, 0, Math.sin(this.elapsed*0.008)*0.05]);
        this.local_transform.setPosition(pos);
        this.local_transform.roll(elapsed * 0.08);
        dirty = true;
        super.update(elapsed, dirty);
    }
}

class DiskPowerUp extends PowerUp {
    constructor(parent, position) {
        super(position, items.disk, models.box, materials.player);
        this.drawable.local_transform.scale([0.1, 0.3, 0.3]);
    }

    toJSON(key) {
        return {
            class: 'DiskPowerUp',
            uuid: this.uuid,
            local_position: this.local_position,
        }
    }
}
classes.DiskPowerUp = DiskPowerUp;

class PlatePowerUp extends PowerUp {
    constructor(parent, position) {
        super(position, items.plate, models.powerups.plate, materials.player);
    }
    
    toJSON(key) {
        return {
            class: 'PlatePowerUp',
            uuid: this.uuid,
            local_position: this.local_position,
        }
    }
}
classes.PlatePowerUp = PlatePowerUp;

class HeadLampPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.lamp, models.powerups.head_lamp, materials.light_inactive);
        this.move_towards_player = true;
        game.scene.entities.push(this);
    }
}

class SuctionDevicePowerUp extends PowerUp {
    constructor(position) {
        super(position, items.suction_device, models.powerups.suction_device, materials.player);
        this.move_towards_player = true;
        game.scene.entities.push(this);
    }
}

class BatteryPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.battery, models.powerups.battery, materials.player);
        this.move_towards_player = true;
        game.scene.entities.push(this);
    }
}

class CounterPressurizerPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.counter_pressurizer, models.powerups.counter_pressurizer, materials.player);
        this.move_towards_player = true;
        game.scene.entities.push(this);
    }
}

class GoldNugget extends Pickable {
    constructor(parent, position) {
        super(null, position);
        this.local_position = position;
        this.drawable = new Drawable(this, [0, 0, 0],  models.gold_nugget1);
        this.drawable.material = materials.gold;
        this.drawable = new Drawable(this, [0, 0, 0],  models.gold_nugget2);
        this.drawable.material = materials.gold_light;
        this.drawable.id = this.id;
        this.item = items.gold_nugget;
        this.label = this.item.name;
    }

    interact() {
        player.pickUp(this);
        game.scene.remove(this);
    }

    toJSON(key) {
        return {
            class: 'GoldNugget',
            uuid: this.uuid,
            local_position: this.local_position,
        }
    }
}
classes.GoldNugget = GoldNugget;

