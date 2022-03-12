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
    interaction_range: 1.5,
    jump_help_strength: 0.0005,
};

class Game {
    constructor() {
        this.scenes = {};
        this.paused = true;
        this.overlay = [0.0, 0.0, 0.0, 0.0];
        this.transition;
        this.time_scaler = 1;
        try {
            this.loadSettings();
        } catch {

        }
        debug_camera = new DebugCamera([6, 6, 8]);
    }
    
    loadLevels() {
        for (const [key, value] of Object.entries(JSON.parse(game.json_levels))) {
            this.scenes[key] = new Scene(value.name, value.entities);
        }
    }
    
    placePlayer(position) {       
        player.local_transform.setPosition(position); 
        player.update(0, true); 
        this.scene.entities.push(player);
        this.scene.colliders.push(...player.getColliders());
    }

    serialize() {
        return JSON.stringify(this.scenes, null, 4);
    }
    
    update(elapsed) {
        elapsed *= this.time_scaler;
        if (!this.paused) {
            this.scene.update(elapsed);
        } else {
            active_camera.update(elapsed);
        }
        if (this.transition) {
            this.transition.update(elapsed);
        }
    }

    startNewGame() {
        playMusic(music.in_game);
        player = new Player();
        this.loadLevels();
        this.scene = this.scenes['Intro'];
        this.placePlayer([3,0,-41]);
        player.camera.activate();
        player.stats.movement_speed = 0.01;
        player.scripting = true;
        materials.green_led.isLight = false; 
        this.time_scaler = 0.5;
        player.transition = new Transition(player, [
            {
                time: 310,
                to: { force: [0.7, 0.0, player.force[2]]},
                callback: () => { 
                    new Dirt(player, [0.4, 0, 0.45], [-1, 0, 0], 40);
                    new HeadLampPowerUp(player.getWorldPosition()).player_position = vec3.clone(player.getWorldPosition());
                    player.force[0] = -0.7;
                }
            },
            {
                time: 630,
                to: { force: [-0.7, 0.0, player.force[2]]},
                callback: () => { 
                    new Dirt(player, [-0.4, 0, 0.45], [1, 0, 0], 40);
                    new SuctionDevicePowerUp(player.getWorldPosition()).player_position = vec3.clone(player.getWorldPosition());
                    player.force[0] = 0.7;
                }
            },
            {
                time: 510,
                to: {force: [0.7, 0.0, player.force[2]]},
                callback: () => { 
                    new Dirt(player, [0.4, 0, 0.45], [-1, 0, 0], 40);
                    new CounterPressurizerPowerUp(player.getWorldPosition()).player_position = vec3.clone(player.getWorldPosition());
                    player.force[0] = -0.7;
                }
            },
            {
                time: 400,
                to: { force: [-0.7, 0.0, player.force[2]]},
                callback: () => { 
                    this.transition = new Transition(this, [
                        {
                            time: 300,
                            to: { overlay: [0.0, 0.0, 0.0, 1.0]},
                            callback: () => {
                                intro = true;
                                this.setScene(this.scenes.Downfall, [18,0,-10]);
                                player.updateStats();
                                player.force = [0, 0, 0];
                                this.time_scaler = 1;
                                player.addLogEntry(0);
                            }
                        },
                        {
                            time: 1000,
                            to: {},
                            callback: () => {
                                player.addLogEntry(1);
                            }
                        },
                        {
                            time: 1000,
                            to: {}
                        },
                        {
                            time: 2000,
                            to: { overlay: [0.0, 0.0, 0.0, 0.0], transition: null },
                            callback: () => {
                                intro = false;
                                materials.green_led.isLight = true; 
                                player.scripting = false;
                                game.paused = false;
                            }
                        }
                    ]);
                }
            },
        ]);
    }

    changeScene(scene, player_position) {
        
        if (scene.containsBoss()) {
            
            this.transition = new Transition(this, [
                {
                    time: 300,
                    to: { overlay: [0.0, 0.0, 0.0, 1.0]},
                    callback: () => {
                        
                        this.paused = true;
                        this.setScene(scene, player_position);
                        this.scene.getAllOfClass('Portal').forEach(portal => {
                            portal.disable();
                        });
                        player.hint = undefined;
                        playMusic(music.boss_intro);
                        // Zoom in on boss
                        player.camera.position = player.camera.getWorldPosition();
                        var original_position = [player.camera.position[0], player.camera.position[1], player.camera.position[2]];
                        var boss = game.scene.getBoss();
                        var boss_position = [boss.getWorldPosition()[0], boss.getWorldPosition()[1] + 3, boss.getWorldPosition()[2]];
                        console.log("boss_position: " + boss_position);
                        console.log("original_position: " + original_position);
                        player.camera.transition = new Transition(player.camera,[
                            {
                                time: 2000,
                                to: { position: boss_position }
                            },
                            {
                                time: 2000,
                                to: { position: original_position, transition: null }, 
                                callback: () => {
                                    game.paused = false;
                                    console.log("original_position: " + original_position);
                                    player.camera.position = undefined;
                                    playMusic(music.boss_fight);
                                }
                            },
                        ]);
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
        if (game.scene) {
            game.scene.remove(player);
            if (player.inventory.includes(items.lamp)) {
                game.scene.removeLight(player.head.lamp);
            }
        }
        game.scene = scene;
        game.scene.entities.push(player);
        if (player.inventory.includes(items.lamp)) {
            game.scene.lights.push(player.head.lamp);
        }
        game.scene.onLoad();
        game.scene.colliders.push(...player.getColliders());
        player.local_transform.setPosition(player_position);
        player.update(0, true); 
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
            inventory: player.inventory.map((item) => item.key),
            pickups: player.pickups,
            position: player.getWorldPosition(),
            scene: game.scene.name,
            slain_bosses: player.slain_bosses,
            time_played: player.time_played,
            entries: player.entries,
            health: player.health,
            hint: player.hint,
        };
        this.saveCookie(cookie);
    }

    load() {
        playMusic(music.in_game);
        var cookie = this.getCookie() || {};
        if (cookie.persistent) {
            player = new Player();
            if (cookie.persistent.slain_bosses) {
                player.slain_bosses = cookie.persistent.slain_bosses;
            }
            if (cookie.persistent.entries) {
                player.entries = cookie.persistent.entries;
            }
            if (cookie.persistent.time_played) {
                player.time_played = cookie.persistent.time_played;
            }
            if (cookie.persistent.health) {
                player.health = cookie.persistent.health;
            }
            if (cookie.persistent.pickups) {
                player.pickups = cookie.persistent.pickups;
            }
            player.hint = cookie.persistent.hint;
            if (cookie.persistent.scene && cookie.persistent.position) {
                this.loadLevels();
                this.setScene(this.scenes[cookie.persistent.scene], cookie.persistent.position);
                player.camera.activate();
            }
            if (cookie.persistent.inventory) {
                cookie.persistent.inventory.forEach((item) => {
                    player.inventory.push(items[item]);
                });
                player.updateStats();
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
