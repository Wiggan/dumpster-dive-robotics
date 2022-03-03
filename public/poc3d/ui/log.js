'use strict'


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
    10: 'Additional plating installed, structural integrity improved.',
    11: 'Gold! Owner will be satisfied upon return.',
};

var line_alpha = 0.1;

function drawLog(entries) {
    

    var focused = active_camera.x < 100 && active_camera.y > d2.canvas.height - 100;
    const log_width = focused ? 500 : 100;
    const log_height = focused ? 500 : 100;
    const padding = focused ? 5 : 1;
    const stride = focused ? 10 : 2;
    
    d2.save();
    d2.font = focused ? "10px Courier New" : "2px Courier New" ;
    d2.strokeStyle = "green";
    d2.globalAlpha = line_alpha;
    d2.strokeRect(0, d2.canvas.height - log_height, log_width, log_height);
    d2.globalAlpha = focused ? 0.8 : 0.1;
    d2.fillStyle = "black";
    d2.fillRect(0, d2.canvas.height - log_height, log_width, log_height);
    
    d2.globalAlpha = focused ? 1.0 : 0.6;
    d2.fillStyle = "green";
    d2.translate(0, d2.canvas.height - stride * (entries.length+1) - padding);
    entries.forEach(entry => {
        d2.fillText('[INFO] ' + log_entries[entry], padding, padding);
        d2.translate(0, stride);
    });
    d2.fillText('[STATS] ' + "HP: " + player.health + "/" + player.stats.max_health + 
        (player.stats.score > 0 ? (" GOLD: " + player.stats.score) : ""), padding, padding);
    d2.translate(0, stride);
    d2.restore();
}

