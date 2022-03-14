'use strict'


var sfx;
var music;

function load_all_sounds() {
    sfx = {
        launch: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - rocket_launching2.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - rocket_launching2.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - rocket_launching2.ogg']}),
        ],
        rocket_exploding: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - rocket_exploding.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - rocket_exploding.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - rocket_exploding.ogg']}),
        ],
        rocket_flying: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - rocket_flying.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - rocket_flying.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - rocket_flying.ogg']}),
        ],
        splash: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - splash.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - splash.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - splash.ogg']}),
        ],
        log_entry: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - log_entry.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - log_entry.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - log_entry.ogg']}),
        ],
        save_game: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - save_game.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - save_game.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - save_game.ogg']}),
        ],
        land: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - land.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - land.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - land.ogg']}),
        ],
        jump: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - jump.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - jump.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - jump.ogg']}),
        ],
        attack: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - attack.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - attack.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - attack.ogg']}),
        ],
        take_damage: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - take_damage.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - take_damage.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - take_damage.ogg']}),
        ],
        pickup: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - pickup2.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - pickup2.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - pickup2.ogg']}),
        ],
        toast: [
            new Howl({ src: ['sfx/ddr_sfx - 01 Start - toast.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 02 - toast.ogg']}),
            new Howl({ src: ['sfx/ddr_sfx - 03 - toast.ogg']}),
        ],
        player_moving: [new Howl({ src: ['sfx/ddr_sfx - 01 Start - moving.ogg'], loop: true})],
        player_dash: [new Howl({ src: ['sfx/ddr_sfx - 01 Start - dash.ogg']})],
        
    }

    music = {
        boss_intro: new Howl({ src: ['music/boss_intro.ogg']}),
        boss_fight: new Howl({ src: ['music/boss_fight.ogg'], loop: true}),
        intro: new Howl({ src: ['music/intro.ogg'], loop: true}),
        in_game: new Howl({ src: ['music/in_game.ogg'], loop: true}),
    }

}

class SFX extends Entity {
    constructor(parent, local_position, sound) {
        super(parent, local_position);
        this.sound = getRandomElement(sound);
        this.id = this.sound.play();
        this.setPosition(parent.getWorldPosition());
        this.sound.on('end', () => {
            if (!this.sound._loop) {
                this.remove();
            }
        }, this.id);
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
        if (this.parent) {
            this.parent.removeChild(this);
        }
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
