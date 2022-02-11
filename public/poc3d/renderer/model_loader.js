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
}