'use strict'


var sfx;
var music;

function load_all_sounds() {
    sfx = {
        launch: [
        ],
        rocket_exploding: [
        ],
        rocket_flying: [
        ]
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

    stop() {
        this.sound.stop(this.id);
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
