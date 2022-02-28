'use strict'

const log_width = 500;
const log_height = 300;
const padding = 5;
const spacing = 10;


const log_entries = {
    0: 'Booting... No persistent memory detected...',
    1: 'Emergency ROM code activated. Limited functionality.',
    2: 'Persistent Memory installed. Rebooting...',
    3: 'Bad sectors detected. Initiating repair...',
    4: 'Sector repaired, missing device scanned, head indicating position.',
    5: 'Light source installed.',
    6: 'Battery expansion installed. Systems run att higher voltage.',
    7: 'Suction device installed. Vertical movement enabled.',
    8: 'Counter pressurizer installed. Underwater operation enabled.',
    9: 'Saving progress. Structural integrity restored.',
};

function drawLog(entries) {
    var focused = active_camera.x < 100 && active_camera.y > d2.canvas.height - 100;
    d2.save();
    d2.font = "10px Courier New";
    d2.globalAlpha = focused ? 0.8 : 0.0;
    d2.fillStyle = "black";
    d2.fillRect(0, d2.canvas.height - log_height, log_width, log_height);
    
    d2.globalAlpha = focused ? 1.0 : 0.6;
    d2.fillStyle = "green";
    d2.translate(0, d2.canvas.height - spacing * entries.length - padding);
    entries.forEach(entry => {
        d2.fillText('[INFO] ' + log_entries[entry], padding, padding);
        d2.translate(0, spacing);
    });
    d2.restore();
}