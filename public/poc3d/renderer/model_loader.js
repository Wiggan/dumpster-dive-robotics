'use strict'

var models = {};
var materials;

async function load_materials(path) {
    return fetch(path).then(response => response.json()).then(mats => materials = mats);
}

async function load_model(path) {
    return fetch(path)
    .then(response => response.json())
    .then(model => {    
        // Calculate the normals using the `calculateNormals` utility function
        const normals = utils.calculateNormals(model.vertices, model.indices);

        // Create a VAO
        const vao = gl.createVertexArray();
  

        // Bind VAO
        gl.bindVertexArray(vao);

        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        // Configure VAO instructions
        gl.enableVertexAttribArray(program.aVertexPosition);
        gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);

        // Normals
        const normalsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        // Configure VAO instructions
        gl.enableVertexAttribArray(program.aVertexNormal);
        gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);

        // Setting up the IBO
        model.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
        
        // Attach them for later access
        model.vao = vao;

        // Clean
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return model;
    }).catch(console.error);
}

async function load_all_models() {
    materials = load_materials('models/materials.json');
    models.box = load_model('models/box/part1.json');
    models.background = load_model('models/background/part1.json');
    models.boulders = load_model('models/boulders1/part1.json');
    models.light = {
        light: load_model('models/light/part1.json'),
        case: load_model('models/light/part2.json'),
    },
    models.player = {
        base: {
            track_frames: [
                load_model('models/robot_tracks2/part2.json'),
                load_model('models/robot_tracks2/part4.json'),
                load_model('models/robot_tracks2/part6.json'),
                load_model('models/robot_tracks2/part8.json'),
                load_model('models/robot_tracks2/part14.json'),
                load_model('models/robot_tracks2/part12.json'),
                load_model('models/robot_tracks2/part10.json'),
            ],
            base_frames: [
                load_model('models/robot_tracks2/part1.json'),
                load_model('models/robot_tracks2/part3.json'),
                load_model('models/robot_tracks2/part5.json'),
                load_model('models/robot_tracks2/part7.json'),
                load_model('models/robot_tracks2/part13.json'),
                load_model('models/robot_tracks2/part11.json'),
                load_model('models/robot_tracks2/part9.json'),
            ],
        },
        body: load_model('models/robot_tracks2/part15.json'),
        head_holder: load_model('models/robot_tracks2/part16.json'),
        head: load_model('models/robot_tracks2/part17.json'),
        head_lamp: load_model('models/robot_tracks2/part19.json'),
        rocket_launcher: load_model('models/robot_tracks2/part18.json'),
        suction_device: load_model('models/robot_tracks2/part20.json'),
        counter_pressurizer: load_model('models/robot_tracks2/part21.json'),
    }
    models.vacuum_fan = {
        base: load_model('models/vacuum_fan/part1.json'),
        wheels: load_model('models/vacuum_fan/part2.json'),
        third_wheel: load_model('models/vacuum_fan/part3.json'),
        fan: load_model('models/vacuum_fan/part4.json'),
        toaster: load_model('models/vacuum_fan/part5.json'),
        table_fan_base: load_model('models/vacuum_fan/part6.json'),
        table_fan_blade: load_model('models/vacuum_fan/part7.json'),
    }
    models.lamp_boss = {
        fan: load_model('models/lamp_boss/part1.json'),
        body: load_model('models/lamp_boss/part2.json'),
        led_list: load_model('models/lamp_boss/part3.json'),
        motors: load_model('models/lamp_boss/part4.json'),
        head_lamp: load_model('models/lamp_boss/part5.json'),
    }
    models.water_boss = {
        launcher: load_model('models/water_boss/part1.json'),
        propeller: load_model('models/water_boss/part2.json'),
        base: load_model('models/water_boss/part3.json'),
    }
    models.powerups = {
        plate: load_model('models/plate_powerup/part1.json'),
        head_lamp: load_model('models/head_lamp_powerup/part1.json'),
        suction_device: load_model('models/suction_device_powerup/part1.json'),
        battery: load_model('models/battery_powerup/part1.json'),
        counter_pressurizer: load_model('models/counter_pressurizer_powerup/part1.json'),
    }
    models.light_sensor = load_model('models/light_sensor/part1.json');
    models.door = load_model('models/door/part1.json');
    models.ball = load_model('models/ball/part1.json');
    models.ceiling_cannon = load_model('models/ceiling_cannon/part1.json');
    models.gold_nugget1 = load_model('models/gold_nugget/part1.json');
    models.gold_nugget2 = load_model('models/gold_nugget/part2.json');
    
    models.pool_boss = {
        wheels: load_model('models/pool_boss/part1.json'),
        base: load_model('models/pool_boss/part2.json'),
        cleaner: load_model('models/pool_boss/part3.json'),
        launcher: load_model('models/pool_boss/part4.json'),
        suction_device: load_model('models/pool_boss/part5.json'),
    }
    models.battery_boss = {
        base: load_model('models/battery_boss/part1.json'),
        battery: load_model('models/battery_boss/part2.json'),
        charger: load_model('models/battery_boss/part3.json'),
    }

    models.cracking_block = [];
    for (var i = 1; i < 16; i++) {
        models.cracking_block.push(load_model('models/cracked_block/part' + i +'.json'));
    }
    // lol...
    materials = await materials;
    models.player.base.track_frames = await Promise.all(models.player.base.track_frames);
    models.player.base.base_frames = await Promise.all(models.player.base.base_frames);
    models.cracking_block = await Promise.all(models.cracking_block);
    
    /* models.player.base.track_frames = await models.player.base.track_frames.map(async (model) => {await model;});
    models.player.base.base_frames = await models.player.base.base_frames.map(async (model) => await model);
    models.cracking_block = await models.cracking_block.map(async (model) => await model);
     */
    models.box = await models.box;
    models.background = await models.background;
    models.boulders = await models.boulders;
    models.light.light = await models.light.light;
    models.light.case = await models.light.case;
    models.player.body = await models.player.body;
    models.player.head_holder = await models.player.head_holder;
    models.player.head = await models.player.head;
    models.player.head_lamp = await models.player.head_lamp;
    models.player.rocket_launcher = await models.player.rocket_launcher;
    models.player.suction_device = await models.player.suction_device;
    models.player.counter_pressurizer = await models.player.counter_pressurizer;
    models.vacuum_fan.base = await models.vacuum_fan.base;
    models.vacuum_fan.wheels = await models.vacuum_fan.wheels;
    models.vacuum_fan.third_wheel = await models.vacuum_fan.third_wheel;
    models.vacuum_fan.fan = await models.vacuum_fan.fan;
    models.vacuum_fan.toaster = await models.vacuum_fan.toaster;
    models.vacuum_fan.table_fan_base = await models.vacuum_fan.table_fan_base ;
    models.vacuum_fan.table_fan_blade = await models.vacuum_fan.table_fan_blade;
    models.lamp_boss.fan = await models.lamp_boss.fan;
    models.lamp_boss.body = await models.lamp_boss.body;
    models.lamp_boss.led_list = await models.lamp_boss.led_list;
    models.lamp_boss.motors = await models.lamp_boss.motors ;
    models.lamp_boss.head_lamp = await models.lamp_boss.head_lamp;
    models.water_boss.launcher = await models.water_boss.launcher;
    models.water_boss.propeller = await models.water_boss.propeller;
    models.water_boss.base = await models.water_boss.base;
    models.powerups.plate = await models.powerups.plate;
    models.powerups.head_lamp = await models.powerups.head_lamp ;
    models.powerups.suction_device = await models.powerups.suction_device;
    models.powerups.battery = await models.powerups.battery;
    models.powerups.counter_pressurizer = await models.powerups.counter_pressurizer;
    models.light_sensor = await models.light_sensor;
    models.door = await models.door;
    models.ball = await models.ball;
    models.ceiling_cannon = await models.ceiling_cannon;
    models.gold_nugget1 = await models.gold_nugget1;
    models.gold_nugget2 = await models.gold_nugget2;
    models.pool_boss.wheels = await models.pool_boss.wheels;
    models.pool_boss.base = await models.pool_boss.base;
    models.pool_boss.cleaner = await models.pool_boss.cleaner;
    models.pool_boss.launcher = await models.pool_boss.launcher;
    models.pool_boss.suction_device = await models.pool_boss.suction_device;
    models.battery_boss.base = await models.battery_boss.base;
    models.battery_boss.battery = await models.battery_boss.battery;
    models.battery_boss.charger = await models.battery_boss.charger;
}