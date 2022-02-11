'use strict';

var program, gaussian_blur_program, ppProgram;

function getShader(path) {
    return fetch(path)
    .then(response => response.text())
    .then(shaderString => {
        var shader;
    
        // Assign shader depending on the type of shader
        if (path.split('.').pop() === 'vert') {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else if (path.split('.').pop() === 'frag') {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else {
            return null;
        }

        // Compile the shader using the supplied shader code
        gl.shaderSource(shader, shaderString);
        gl.compileShader(shader);

        // Ensure the shader is valid
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }).catch(console.error);
}

async function loadProgram(vert, frag) {
    const vertexShader = await getShader(vert);
    const fragmentShader = await getShader(frag);

    // Create a program
    var program = gl.createProgram();
    // Attach the shaders to this program
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

    // Use this program instance
    gl.useProgram(program);

    var na = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    //console.log(na, 'attributes');
    for (var i = 0; i < na; ++i) {
        var a = gl.getActiveAttrib(program, i);
        console.log(i, a.size, a.type, a.name);
        program[a.name] = gl.getAttribLocation(program, a.name);
    }
    var nu = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    //console.log(nu, 'uniforms');
    for (var i = 0; i < nu; ++i) {
        var u = gl.getActiveUniform(program, i);
        program[u.name] = gl.getUniformLocation(program, u.name);
        console.log(i, u.size, u.type, u.name);
    }

    return program;
}

async function initProgram() {
    program = await loadProgram('/programs/vertex_shader.vert', '/programs/fragment_shader.frag');
    gaussian_blur_program = await loadProgram('/programs/post_processing_vexter_shader.vert', '/programs/gaussian_blur.frag');
    ppProgram = await loadProgram('/programs/post_processing_vexter_shader.vert', '/programs/glow_fragment_shader.frag');
    
}
