'use strict'

class PowerUp extends Pickable {
    constructor(position, item, model, material) {
        super(null, position);
        this.local_position = position;
        this.drawable = new Drawable(this, [0, 0, 0], model);
        this.drawable.material = material;
        this.drawable.id = this.id;
        this.particles = new PowerUpParticles(this, [0, 0 ,0]);
        this.item = item;
        this.label = this.item.name;
        this.elapsed = 0;
    }

    interact() {
        player.pickUp(this);
        game.scene.remove(this);
    }

    toJSON(key) {
        return '';
    }


    update(elapsed, dirty) {
        this.elapsed += elapsed;
        var pos = vec3.create();
        vec3.add(pos, this.local_position, [0, 0, Math.sin(this.elapsed*0.008)*0.05]);
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
        game.scene.entities.push(this);
    }
}

class SuctionDevicePowerUp extends PowerUp {
    constructor(position) {
        super(position, items.suction_device, models.powerups.suction_device, materials.light_inactive);
        game.scene.entities.push(this);
    }
}

class BatteryPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.battery, models.powerups.battery, materials.blue);
        game.scene.entities.push(this);
    }
}

class CounterPressurizerPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.counter_pressurizer, models.powerups.counter_pressurizer, materials.player);
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

