'use strict';

// Global variables that are set and used
// across the application
let renderer, gui, editor_camera;


var frame_intervals = [];
var fps = 0;
var then = Date.now();
var now = Date.now();
function render() {
    try {
        requestAnimationFrame(render);
        now = Date.now();
        var elapsed = now - then;
        frame_intervals.push(elapsed);
        game.update(0);
        editor_camera.update(elapsed);
        then = now;
        game.scene.draw(renderer);
        editor_camera.draw(renderer);
        if (frame_intervals.length == 60) {
            fps = Math.floor(60000 / frame_intervals.reduce((total, interval) => total + interval));
            frame_intervals.length = 0;
        }
        renderer.render();
    } catch (error) {
        console.error(error);
    }
}

// Entry point to our application
async function init() {
    
    renderer = new Renderer();
    await initProgram();
    await load_all_models();
    await load_all_sounds();
    game = new Game();
    await fetch('/models/levels.json').then(response => response.json()).then(levels => game.loadLevels(levels));
    
    for (const [key, value] of Object.entries(game.scenes)) {
        game.scenes[key].entities.forEach(entity => {
            if (!entity.id) {
                entity.makePickable();
            }
        });
        //value.entities.push(new DebugCamera([6, 6, 8]));
    }
    
    
    editor_camera = new EditorCamera([6, 16, 8]);
    editor_camera.activate();
    picking = true;
    render();
    initControls();
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
        active_camera.onKeyUp(e);
    });
    window.addEventListener('keydown', (e) => {
        if (e.key == 's' && e.ctrlKey) {
            download('materials.json', JSON.stringify(materials, null, 4));
            download('levels.json', JSON.stringify(game.serialize(), null, 4));
            e.preventDefault();
        }
        active_camera.onKeyDown(e);
    });


    gui = new dat.GUI({name: 'Editor'});
    var scenes_folder = gui.addFolder('Scenes');
    var current_scene = {scene: game.scene.name};
    var changeScene = (scene_name) => {
        game.scene = game.scenes[scene_name];
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
    }

    
    /* 
    var controls = {};
    controls.materials = {};
    for (const [key, value] of Object.entries(materials)) {
        controls.materials[key] = {
            'Diffuse': {
                value: denormalizeColor(value.diffuse),
                onChange: v => value.diffuse = normalizeColor(v)
            },
            'Ambient': {
                value: denormalizeColor(value.ambient),
                onChange: v => value.ambient = normalizeColor(v)
            },
            'Specular': {
                value: denormalizeColor(value.specular),
                onChange: v => value.specular = normalizeColor(v)
            },
            'Shininess': {
                value: value.shininess,
                min: 1, max: 50, step: 0.1,
                onChange: v => value.shininess = v
            },
            'Light': {
                value: value.isLight,
                onChange: v => value.isLight = v
            },
        }
    }
    controls.lights = {
        'Diffuse': {
            value: denormalizeColor(LanternLight.Diffuse),
            onChange: v => game.scene.lights.forEach(light => light.diffuse = normalizeColor(v))
        },
        'Ambient': {
            value: denormalizeColor(LanternLight.Ambient),
            onChange: v => game.scene.lights.forEach(light => light.ambient = normalizeColor(v))
        },
        'Specular': {
            value: denormalizeColor(LanternLight.Specular),
            onChange: v => game.scene.lights.forEach(light => light.specular = normalizeColor(v))
        },
        'Constant': {
            value: 1,
            min: 0, max: 2, step: 0.1,
            onChange: v => game.scene.lights.forEach(light => light.constant = v)
        },
        'Linear': {
            value: 0.35,
            min: 0, max: 10, step: 0.05,
            onChange: v => game.scene.lights.forEach(light => light.linear = v)
        },
        'Quadratic': {
            value: 0.9,
            min: 0, max: 10, step: 0.05,
            onChange: v => game.scene.lights.forEach(light => light.quadratic = v)
        },
    } */

    /* controls.particles = {
        'Count': {
            value: 10,
            min: 1, max: 50, step: 1,
            onChange: v => game.scene.particles.setParticleCount(v)
        },
        'Spread': {
            value: game.scene.particles.spread,
            min: 0, max: 1, step: 0.01,
            onChange: v => game.scene.particles.spread = v
        },
        'Particle life time': {
            value: game.scene.particles.particle_life_time,
            min: 0, max: 5000, step: 10,
            onChange: v => game.scene.particles.particle_life_time = v
        },
        'Minimal particle speed': {
            value: game.scene.particles.min_speed,
            min: 0, max: 0.01, step: 0.0001,
            onChange: v => game.scene.particles.min_speed = Math.min(game.scene.particles.max_speed, v)
        },
        'Maximal particle speed': {
            value: game.scene.particles.max_speed,
            min: 0, max: 0.01, step: 0.0001,
            onChange: v => game.scene.particles.max_speed = Math.max(game.scene.particles.min_speed, v)
        },
        'Continuous': {
            value: game.scene.particles.continuous,
            onChange: v => {
                game.scene.particles.continuous = v;
            }
        },
        'Start randomly': {
            value: game.scene.particles.start_randomly,
            onChange: v => game.scene.particles.start_randomly = v
        },
        'Direction': {
            value: game.scene.particles.direction,
            onChange: v => game.scene.particles.direction = v
        },
        'Start Color': {
            value: denormalizeColor(game.scene.particles.start.color),
            onChange: v => game.scene.particles.start.color = normalizeColor(v)
        },
        'Start Scale': {
            value: game.scene.particles.start.scale,
            min: 0, max: 1, step: 0.01,
            onChange: v => game.scene.particles.start.scale = v
        },
        'Stop Color': {
            value: denormalizeColor(game.scene.particles.stop.color),
            onChange: v => game.scene.particles.stop.color = normalizeColor(v)
        },
        'Stop Scale': {
            value: game.scene.particles.stop.scale,
            min: 0, max: 1, step: 0.01,
            onChange: v => game.scene.particles.stop.scale = v
        },
    } */
    
    

    //utils.configureControls(controls);
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