'use strict';

// Global variables that are set and used
// across the application
let renderer, gui, editor_camera, debug_camera;


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
        if (game.scene) {
            if (player || game.scene.particles) {
                game.update(Math.min(elapsed, 30));
            } else {
                game.update(0);
            }
            //game.scene.update(elapsed);
            game.scene.draw(renderer);
        }
        editor_camera.update(elapsed);
        debug_camera.update(elapsed);
        then = now;
        editor_camera.draw(renderer);
        debug_camera.draw(renderer);
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

// Entry point to our application
async function init() {
    
    renderer = new Renderer();
    await initProgram();
    await load_all_models();
    await load_all_sounds();
    game = new Game();
    await fetch('/models/levels.json').then(response => response.json()).then(levels => game.json_levels = levels);
    
    debug_camera = new DebugCamera([6, 6, 8]);
    editor_camera = new EditorCamera([0, 16, -5]);
    picking = true;
    
    render();
    
    //game.startNewGame();
    player = new Player();
    game.loadLevels();
    game.setScene(game.scenes['PoolBossRoom'], [1600, 0, -6]);
    game.scene.lights.push(editor_camera.light);
    
    for (const [key, value] of Object.entries(game.scenes)) {
        game.scenes[key].entities.forEach(entity => {
            if (!entity.id) {
                entity.makePickable();
            }
        });
    }
    initGui();
    editor_camera.activate();
    initControls();
    
}


function setSavedGameExists(exists) {
    //...
}
function showStartScreen() {
    game.overlay = [0.0, 0.0, 0.0, 0.0];
    player = new Player();
    game.loadLevels();
    game.setScene(game.scenes['PoolBossRoom'], [1600, 0, -6]);
    game.scene.lights.push(editor_camera.light);
    editor_camera.activate();
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
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
        if (e.target.localName != "input") {
            active_camera.onKeyUp(e);
        }
    });
    window.addEventListener('keydown', (e) => {
        if (e.target.localName != "input") {
            if (e.key == 'm' && e.ctrlKey) {
                download('materials.json', JSON.stringify(materials, null, 4));
                e.preventDefault();
            }
            if (e.key == 'l' && e.ctrlKey) {
                download('levels.json', JSON.stringify(game.serialize(), null, 4));
                e.preventDefault();
            }
            active_camera.onKeyDown(e);
        }
    });
}

function initGui() {

    gui = new dat.GUI({name: 'Editor'});
    var scenes_folder = gui.addFolder('Scenes');
    var current_scene = {scene: game.scene.name};
    var changeScene = (scene_name) => {
        game.scene = game.scenes[scene_name];

        game.scene.lights.push(editor_camera.light);
    } 
    var scene_list = scenes_folder.add(current_scene, 'scene', Object.keys(game.scenes)).onChange(changeScene);
    var new_scene = {name: ''};
    scenes_folder.add(new_scene, 'name').onFinishChange(v => {
        if (v) {
            game.scenes[v] = new Scene(v, []);
            scenes_folder.remove(scene_list);
            scene_list = scenes_folder.add(current_scene, 'scene', Object.keys(game.scenes)).onChange(changeScene);
            scene_list.setValue(v);
        }
    });

    var material_folder = gui.addFolder('Materials');
    for (const [key, value] of Object.entries(materials)) {
        var material = material_folder.addFolder(key);
        ['ambient', 'diffuse', 'specular'].forEach(color => {
            const c = {};
            c[color] = denormalizeColor(value[color]);
            var controller = material.addColor(c, color);
            controller.onChange(v => value[color] = normalizeColor(v));
        });
        material.add(value, 'shininess', 1, 50, 0.1);
        material.add(value, 'isLight');
        material.add(value, 'growth');
    }

    var renderer_folder = gui.addFolder('Renderer');
    renderer_folder.add(renderer, 'fov', 10, 110, 1);
    renderer_folder.add(renderer, 'width_factor', -2, 2, 0.001);

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
window.onload = init;