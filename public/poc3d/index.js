'use strict';

// Global variables that are set and used
// across the application
let renderer, debug_camera;

var frame_intervals = [];
var fps = 0;
var then = Date.now();
var now = Date.now();
function render() {
    var animationRequest;
    try {
        animationRequest = requestAnimationFrame(render);
        now = Date.now();
        var elapsed = now - then;
        frame_intervals.push(elapsed);
        var throttled_elapsed = Math.min(30, elapsed);
        var before = Date.now();
        game.update(throttled_elapsed);
        var after = Date.now();
        console.log(after - before);
        debug_camera.update(elapsed);
        then = now;
        if (game.scene) {
            game.scene.draw(renderer);
        }
        if (frame_intervals.length == 60) {
            fps = Math.floor(60000 / frame_intervals.reduce((total, interval) => total + interval));
            frame_intervals.length = 0;
        }
        renderer.render();

    } catch (error) {
        console.error(error);
        cancelAnimationFrame(animationRequest);
    }
}

async function loadAssets() {
    document.getElementById("init").textContent = "0%";
    renderer = new Renderer();
    document.getElementById('outer-container').style.height=gl.canvas.height + 'px';
    await initProgram();
    document.getElementById("init").textContent = "25%";
    await load_all_models();
    document.getElementById("init").textContent = "50%";
    load_all_sounds();
    document.getElementById("init").textContent = "75%";
    game = new Game();
    await fetch('models/levels.json').then(response => response.json()).then(levels => game.json_levels = levels);

    initControls();
    render();
}

// Entry point to our application
function start() {

}

function initControls() {
    
    var canvas = utils.getCanvas('text_canvas');
    canvas.onmousedown = (e) => {
        active_camera.onmousedown(e);
    }
    canvas.onmouseup = (e) => {
        active_camera.onmouseup(e);
    }
    canvas.onclick = (e) => {
        active_camera.onclick(e);
    }
    canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); return false;}
    window.addEventListener('keyup', (e) => {
        active_camera.onKeyUp(e);
    });
    window.addEventListener('keydown', (e) => {
        active_camera.onKeyDown(e);
    });
}

// De-normalize colors from 0-1 to 0-255
function denormalizeColor(color) {
    return color.map((c) => c * 255);
}

// Normalize colors from 0-255 to 0-1
function normalizeColor(color) {
    return color.map((c) => c / 255);
}

// Call init once the webpage has loaded
//window.onload = init;