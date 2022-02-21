'use strict'

var player;
var game;
var classes = {};
var settings = {};

const constants = {
    gravity: 0.000048,
    dash_timing: 150,
    dash_duration: 800,
    dash_cooldown: 1600,
    jump_forgiveness: 200,
    jump_cooldown: 300,
    dmg_cooldown: 1000,
    interaction_range: 1.5
};

class Game {
    constructor() {
        this.scenes = {};
        this.paused = false;
        this.overlay = [0.0, 0.0, 0.0, 0.0];
        this.transition;
        this.slain_bosses = [];
        try {
            this.loadSettings();
        } catch {

        }
    }
    
    loadLevels(levels, start_scene) {
        for (const [key, value] of Object.entries(JSON.parse(levels))) {
            this.scenes[key] = new Scene(value.name, value.entities);
        }
        this.scene = this.scenes[start_scene || 'Downfall'];
    }
    
    placePlayer(position) {        
        player = new Player(position);/* 
        player.equip(new DoubleLauncher(null, [0, 0, 0]), player.sockets.right_arm);
        player.equip(new Launcher(null, [0, 0, 0]), player.sockets.left_arm); */
        this.scene.entities.push(player);
        this.scene.colliders.push(...player.getColliders());
    }

    serialize() {
        return JSON.stringify(this.scenes, null, 4);
    }
    
    update(elapsed) {
        if (!this.paused) {
            this.scene.update(elapsed);
        }
        if (this.transition) {
            this.transition.update(elapsed);
        }
    }

    startNewGame() {
        //playMusic(music.in_game);
        // Todo
    }

    changeScene(scene, player_position) {
        this.paused = true;
        
        if (scene.name.includes('Boss')) {
            this.transition = new Transition(this, [
                {
                    time: 300,
                    to: { overlay: [0.0, 0.0, 0.0, 1.0]},
                    callback: () => {
                        
                        this.setScene(scene, player_position);
                        if (scene.containsBoss()) {
                            this.scene.getAllOfClass('Portal').forEach(portal => {
                                portal.disable();
                            });
                        }
                        game.paused = false;
                    }
                },
                {
                    time: 300,
                    to: { overlay: [0.0, 0.0, 0.0, 0.0], transition: null }
                }
            ]);
        } else {
            this.transition = new Transition(this, [
                {
                    time: 300,
                    to: { overlay: [0.0, 0.0, 0.0, 1.0]},
                    callback: () => {
                        this.setScene(scene, player_position);
                        game.paused = false;
                    }
                },
                {
                    time: 300,
                    to: { overlay: [0.0, 0.0, 0.0, 0.0], transition: null }
                }
            ]);
        }
    }

    setScene(scene, player_position) {
        game.scene.remove(player);
        game.scene = scene;
        game.scene.entities.push(player);
        player.local_transform.setPosition(player_position);
        game.scene.update(0);
    }

    showMenu() {
        this.getCookie(); // To get disabled buttons right... blah
        this.transition = new Transition(this, [
            {
                time: 300,
                to: { overlay: [0.0, 0.0, 0.0, 0.8], paused: true, transition: null},
                callback: () => {
                    game.scene.update(0);
                    //showView("outer-container");
                    showView(views.menu);
                    document.getElementById("outer-container").style.display = "block";
                } 
            }
        ]);
    }

    hideMenu() {
        document.getElementById("outer-container").style.display = "none";
        //document.getElementById("outer-container").style.opacity = 0.0;
        this.paused = false;
        this.transition = new Transition(this, [
            {
                time: 300,
                to: { overlay: [0.0, 0.0, 0.0, 0.0], transition: null}
            }
        ]);
    }

    save() {
        var cookie = this.getCookie() || {};
        cookie.persistent = {
            inventory: player.inventory,
            position: player.getWorldPosition(),
            scene: game.scene.name,
            slain_bosses: game.slain_bosses
        };
        this.saveCookie(cookie);
    }

    load() {
        //playMusic(music.in_game);
        var cookie = this.getCookie() || {};
        if (cookie.persistent) {
            if (cookie.persistent.scene && cookie.persistent.position) {
                this.setScene(this.scenes[cookie.persistent.scene], cookie.persistent.position);
            }
            if (cookie.persistent.inventory) {
                player.inventory = cookie.persistent.inventory;
            }
            if (cookie.persistent.slain_bosses) {
                this.slain_bosses = cookie.persistent.slain_bosses;
            }
        }
    }

    saveSettings() {
        var cookie = this.getCookie() || {};
        cookie.settings = settings;
        this.saveCookie(cookie);
        setSfxVolume(settings.sfx_volume);
        setMusicVolume(settings.music_volume);
    }

    loadSettings() {
        var cookie = this.getCookie() || {};
        if (cookie.settings) {
            settings = cookie.settings;
            document.getElementById("music_slider").value = settings.music_volume;
            document.getElementById("sfx_slider").value = settings.sfx_volume;
            setSfxVolume(settings.sfx_volume);
            setMusicVolume(settings.music_volume);
        }
    }

    saveCookie(cookie) {
        document.cookie = 'cookie=' + JSON.stringify(cookie) +';expires=Tue, 19 Jan 2038 04:14:07 GMT; SameSite=Lax;';
    }

    getCookie() {
        let splitCookie = document.cookie.split(/[=;\s]/);
        var index = splitCookie.indexOf('cookie');
        if (index > -1) {
            var cookie = JSON.parse(splitCookie[index + 1]);
            setSavedGameExists(cookie.persistent != undefined);
            return cookie;
        }
    }
}
