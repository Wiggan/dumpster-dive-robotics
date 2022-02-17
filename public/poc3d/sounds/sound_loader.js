'use strict'


var sfx;
var music;

function load_all_sounds() {
    sfx = {
        launch: [
            new Howl({ src: ['/sfx/ddr_sfx - 01 Start - rocket_launching.ogg']}),
            new Howl({ src: ['/sfx/ddr_sfx - 02 - rocket_launching.ogg']}),
            new Howl({ src: ['/sfx/ddr_sfx - 03 - rocket_launching.ogg']}),
        ],
        rocket_exploding: [
            new Howl({ src: ['/sfx/ddr_sfx - 01 Start - rocket_exploding.ogg']}),
            new Howl({ src: ['/sfx/ddr_sfx - 02 - rocket_exploding.ogg']}),
            new Howl({ src: ['/sfx/ddr_sfx - 03 - rocket_exploding.ogg']}),
        ],
        rocket_flying: [
            new Howl({ src: ['/sfx/ddr_sfx - 01 Start - rocket_flying.ogg']}),
            new Howl({ src: ['/sfx/ddr_sfx - 02 - rocket_flying.ogg']}),
            new Howl({ src: ['/sfx/ddr_sfx - 03 - rocket_flying.ogg']}),
        ],
        player: {
            moving: [new Howl({ src: ['/sfx/ddr_sfx - 01 Start - moving.ogg'], loop: true})],
            moving_faster: [new Howl({ src: ['/sfx/ddr_sfx - 02 - moving.ogg'], loop: true})],
            dash: [new Howl({ src: ['/sfx/ddr_sfx - 01 Start - dash.ogg']})],
        }
    }

    music = {
    }

}

class SFX extends Entity {
    constructor(parent, local_position, sound) {
        super(parent, local_position);
        this.sound = getRandomElement(sound);
        this.id = this.sound.play();
        this.setPosition(parent.getWorldPosition());
    }

    setPosition(pos) {
        this.sound.pos(pos[0], pos[1], pos[2], this.id);
    }

    update(elapsed, dirty) {
        super.update(elapsed, dirty);
        if (dirty) {
            this.setPosition(this.getWorldPosition());
        }
    }

    remove() {
        this.parent.removeChild(this);
    }

    setRate(rate) {
        this.sound.rate(rate, this.id);
    }

    stop() {
        this.sound.stop(this.id);
        this.remove();
    }
}

function playMusic(song) {
    for (const [key, value] of Object.entries(music)) {
        value.stop();
    }
    song.play();
}

function setSfxVolume(volume) {
    for (const [key, value] of Object.entries(sfx)) {
        value.forEach(howl => howl.volume(volume));
    }
}

function setMusicVolume(volume) {
    for (const [key, value] of Object.entries(music)) {
        value.volume(volume);
    }
}

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}
