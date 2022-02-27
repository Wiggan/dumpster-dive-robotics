'use strict'

class PowerUp extends Pickable {
    constructor(position, item, model, material) {
        super(null, position);
        this.position = position;
        this.drawable = new Drawable(this, [0, 0, 0], model);
        this.drawable.material = material;
        this.drawable.id = this.id;
        this.particles = new PowerUpParticles(this, [0, 0 ,0]);
        this.item = item;
        this.label = this.item.name;
        game.scene.entities.push(this);
        this.elapsed = 0;
    }

    interact() {
        player.pickUp(this.item);
        game.scene.remove(this);
    }

    toJSON(key) {
        return '';
    }


    update(elapsed, dirty) {
        this.elapsed += elapsed;
        var pos = vec3.create();
        vec3.add(pos, this.position, [0, 0, Math.sin(this.elapsed*0.008)*0.05]);
        this.local_transform.setPosition(pos);
        this.local_transform.roll(elapsed * 0.08);
        dirty = true;
        super.update(elapsed, dirty);
    }
}

class HeadLampPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.lamp, models.powerups.head_lamp, materials.light_inactive);
    }
}

class SuctionDevicePowerUp extends PowerUp {
    constructor(position) {
        super(position, items.suction_device, models.powerups.suction_device, materials.light_inactive);
    }
}

class BatteryPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.battery, models.powerups.battery, materials.blue);
    }
}

class CounterPressurizerPowerUp extends PowerUp {
    constructor(position) {
        super(position, items.counter_pressurizer, models.powerups.counter_pressurizer, materials.player);
    }
}


