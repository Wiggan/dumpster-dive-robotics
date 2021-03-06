'use strict'

var saved_game_exists = false;

const views = {
    init: "init-content",
    start: "start-content",
    menu: "menu-content",
    victory: "victory-content",
    settings: "settings-content"
}

function hideAllViews() {
    for (const [key, value] of Object.entries(views)) {
        hideView(value);
    }
}

function setSavedGameExists(exists) {
    saved_game_exists = exists;
    document.getElementById("continue").disabled = !exists;
    document.getElementById("load").disabled = !exists;
}

function showStartScreen() {
    document.getElementById("outer-container").style.display = "block";
    game.getCookie(); // To get disabled buttons right... blah
    playMusic(music.intro);
    hideAllViews();
    game.overlay = [0.0, 0.0, 0.0, 1.0];
    game.paused = true;
    showView(views.start);
}


function showVictoryScreen() {
    document.getElementById("outer-container").style.display = "block";
    playMusic(music.intro);
    hideAllViews();
    document.getElementById("gold_count").textContent = player.stats.score;
    document.getElementById("time_it_took").textContent = Math.floor(player.time_played / 60) + ":" + player.time_played % 60;
    showView(views.victory);
}

function initMenu() {
    document.getElementById("init").onclick = async (e) => {
        document.getElementById("init").disabled = true;
        await loadAssets();
        showStartScreen();
    };
    document.getElementById("resume").onclick = (e) => {
        game.hideMenu();
    };
    document.getElementById("load").onclick = (e) => {
        mscConfirm('Load?', 'All unsaved progress will be lost.', () => { game.load(); game.hideMenu(); });
    };
    document.getElementById("settings").onclick = async (e) => {
        enterSettings();
    };
    document.getElementById("exit").onclick = async (e) => {    
        mscConfirm('Exit to main menu?', 'All unsaved progress will be lost.', () => { 
            showStartScreen();
        });
    };
    document.getElementById("back").onclick = async (e) => {
        leaveSettings();
    };
    document.getElementById("music_slider").oninput = () => {
        settings.music_volume = document.getElementById("music_slider").value;
    };
    document.getElementById("sfx_slider").oninput = () => {
        settings.sfx_volume = document.getElementById("sfx_slider").value;
    };
    document.getElementById("cb_checkbox").oninput = () => {
        settings.cb = document.getElementById("cb_checkbox").checked;
    };
    
    document.getElementById("continue").onclick = (e) => {
        game.load();
        game.hideMenu();
        hideAllViews();
    };
    
    document.getElementById("new_game").onclick = (e) => {
        if (saved_game_exists) {
            mscConfirm('Start new game?', 'All unsaved progress will be lost.', () => { 
                game.startNewGame();
                game.hideMenu();
                hideAllViews();
            });
        } else {
            game.startNewGame();
            game.hideMenu();
            hideAllViews();
        }
    };
    document.getElementById("new_game2").onclick = (e) => {
        game.startNewGame();
        game.hideMenu();
        hideAllViews();
    };
    document.getElementById("continue").disabled = true;
    document.getElementById("load").disabled = true;
}

function enterSettings() {
    hideAllViews();
    showView(views.settings);
}

function leaveSettings() {
    game.saveSettings();
    hideAllViews();
    showView(views.menu);
}

function showView(id) {
    document.getElementById(id).style.display = "flex";
}

function hideView(id) {
    document.getElementById(id).style.display = "none";
}

function toggleMenuVisible() {
    if (document.getElementById("outer-container").style.display && document.getElementById("outer-container").style.display != "none") {
        if (document.getElementById("settings-content").style.display && document.getElementById("settings-content").style.display != "none") {
            leaveSettings()
        } else {
            game.hideMenu();
        }
    } else {
        game.showMenu();
    }
}


window.onload = initMenu;