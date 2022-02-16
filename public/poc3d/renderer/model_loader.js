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
    materials = await load_materials('/models/materials.json');
    models.box = await load_model('/models/box/part1.json');
    models.background = await load_model('/models/background/part1.json');
    models.player = {
        base: {
            track_frames: [
                await load_model('/models/robot_tracks2/part2.json'),
                await load_model('/models/robot_tracks2/part4.json'),
                await load_model('/models/robot_tracks2/part6.json'),
                await load_model('/models/robot_tracks2/part8.json'),
                await load_model('/models/robot_tracks2/part14.json'),
                await load_model('/models/robot_tracks2/part12.json'),
                await load_model('/models/robot_tracks2/part10.json'),
            ],
            base_frames: [
                await load_model('/models/robot_tracks2/part1.json'),
                await load_model('/models/robot_tracks2/part3.json'),
                await load_model('/models/robot_tracks2/part5.json'),
                await load_model('/models/robot_tracks2/part7.json'),
                await load_model('/models/robot_tracks2/part13.json'),
                await load_model('/models/robot_tracks2/part11.json'),
                await load_model('/models/robot_tracks2/part9.json'),
            ],
        },
        body: await load_model('/models/robot_tracks2/part15.json'),
        head_holder: await load_model('/models/robot_tracks2/part16.json'),
        head: await load_model('/models/robot_tracks2/part17.json'),
        head_lamp: await load_model('/models/robot_tracks2/part19.json'),
        rocket_launcher: await load_model('/models/robot_tracks2/part18.json'),
    }
    models.light_sensor = await load_model('/models/light_sensor/part1.json');
    models.door = await load_model('/models/door/part1.json');
    models.ball = await load_model('/models/ball/part1.json');
}