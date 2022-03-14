'use strict';

var program, gaussian_blur_program, ppProgram;

function getShader(path) {
    var shaderString;

    switch(path) {
        case 'programs/vertex_shader.vert':
            shaderString = '#version 300 es\nprecision mediump float;\n\n\nuniform mat4 uProjectionMatrix;\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uNormalMatrix;\n\nin vec3 aVertexPosition;\nin vec3 aVertexNormal;\n\nout vec3 vFragPos;\nout vec3 vNormal;\n\nvoid main(void) {\n    vFragPos = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));\n\n    \/\/ Set varyings to be used in fragment shader\n    vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));\n\n    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);\n}';
            break;
        case 'programs/fragment_shader.frag':
            shaderString = '#version 300 es\nprecision mediump float;\n\n#define numLights 4\n\nstruct PointLight {\n    vec3 position;\n    \n    float constant;\n    float linear;\n    float quadratic;  \n\n    vec3 ambient;\n    vec3 diffuse;\n    vec3 specular;\n};\n\nstruct Material {\n    vec3 ambient;\n    vec3 diffuse;\n    vec3 specular;\n    float shininess;\n    bool isLight;\n    bool growth;\n};\n\nuniform vec3 uCameraPos;\nuniform uint uIdColor;\nuniform int uNumLights;\nuniform bool uDebug;\nuniform bool uSelected;\nuniform PointLight uLight[numLights];\nuniform Material uMaterial;\n\nin vec3 vFragPos;\nin vec3 vNormal;\n\nlayout(location = 0) out vec4 fragColor;\nlayout(location = 1) out vec4 brightColor;\nlayout(location = 2) out uint idColor;\n\nvec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {\n    vec3 lightDir = normalize(light.position - fragPos);\n    \/\/ diffuse shading\n    float diff = max(dot(normal, lightDir), 0.0);\n    \/\/ specular shading\n    vec3 reflectDir = reflect(-lightDir, normal);\n    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shininess);\n    \/\/ attenuation\n    float distance    = length(light.position - fragPos);\n    float attenuation = 1.0 \/ (light.constant + light.linear * distance + \n  \t\t\t     light.quadratic * (distance * distance));\n\n    \/\/ growth\n    vec3 norm = normalize(vNormal);\n    float angle = acos(dot(norm, vec3(0.0, 0.0, -1.0)));\n\n    vec3 diffuse_material = uMaterial.diffuse;\n    vec3 ambient_material = uMaterial.ambient;\n\n    if (uMaterial.growth) {\n        float alpha = min(0.9, max(0.0, 0.5 \/ (0.5 + angle)));\n        diffuse_material = mix(uMaterial.diffuse, vec3(0.2, 0.3, 0.0), alpha);\n        ambient_material = mix(uMaterial.ambient, vec3(0.2, 0.3, 0.0), alpha);\n    }\n\n    \/\/ combine results\n    vec3 ambient  = light.ambient  * ambient_material;\n    vec3 diffuse  = light.diffuse  * diff * diffuse_material;\n    vec3 specular = light.specular * spec * uMaterial.specular;\n    ambient  *= attenuation;\n    diffuse  *= attenuation;\n    specular *= attenuation;\n    return (ambient + diffuse + specular);\n} \n\n\nvoid main() {\n    idColor = uIdColor;\n    if (uDebug){\n        fragColor = vec4(1.0, 0.0, 1.0, 1.0);\n        brightColor = fragColor;\n    } else if (uMaterial.isLight) {\n        fragColor = vec4(uMaterial.diffuse, 1.0);\n        brightColor = fragColor;\n    } else {\n        \/\/ properties\n        vec3 norm = normalize(vNormal);\n        vec3 viewDir = normalize(uCameraPos - vFragPos);\n\n        vec3 result = vec3(0); \n        \/\/ phase 2: Point lights\n        for(int i = 0; i < uNumLights; i++)\n            result += CalcPointLight(uLight[i], norm, vFragPos, viewDir);\n        \n        \/\/fragColor = vec4(result, 1.0);\n        brightColor = vec4(0.0, 0.0, 0.0, 1.0);\n        \/\/ Depth fog\n        float depth = vFragPos.y*-0.05 + 0.1;\n        float alpha = min(max(depth, 0.0), 0.7);\n        result = mix(result, vec3(0.2, 0.2, 0.1), alpha);\n\n        \/\/ Fog-style water\n        if (vFragPos.y < 0.9 && vFragPos.z > 0.0) {\n            depth = (vFragPos.z + 3.0) * 0.03;\n            alpha = min(max(depth, 0.0), 0.5);\n            result = mix(result, vec3(0.0, 0.1, 0.2), alpha);\n        }\n\n        fragColor = vec4(result, 1.0);\n        \n    }\n    if (uSelected) {\n        fragColor += vec4(0.2, 0.2, 0.4, 1.0);\n        brightColor = fragColor;\n    }\n}\n';
        break;
        case 'programs/post_processing_vexter_shader.vert':
            shaderString = '#version 300 es\nprecision mediump float;\n\nin vec2 aVertexPosition;\nin vec2 aVertexTextureCoords;\n\nout vec2 vTextureCoords;\n\nvoid main(void) {\n    vTextureCoords = aVertexTextureCoords;\n    gl_Position = vec4(aVertexPosition, 0.0, 1.0);\n}\n';
        break;
        case 'programs/gaussian_blur.frag':
            shaderString = '#version 300 es\nprecision mediump float;\n\nout vec4 FragColor;\n  \nin vec2 vTextureCoords;\n\nuniform sampler2D image;\n  \nuniform bool horizontal;\nfloat weight[5];\n\nvoid main()\n{             \n    weight[0] = 0.227027;\n    weight[1] = 0.1945946;\n    weight[2] = 0.1216216;\n    weight[3] = 0.054054;\n    weight[4] = 0.016216;\n    vec2 tex_offset = vec2(1) \/ vec2(textureSize(image, 0)); \/\/ gets size of single texel\n    vec3 result = texture(image, vTextureCoords).rgb * weight[0]; \/\/ current fragment\'s contribution\n    if(horizontal)\n    {\n        for(int i = 1; i < 5; ++i)\n        {\n            result += texture(image, vTextureCoords + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];\n            result += texture(image, vTextureCoords - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];\n        }\n    }\n    else\n    {\n        for(int i = 1; i < 5; ++i)\n        {\n            result += texture(image, vTextureCoords + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];\n            result += texture(image, vTextureCoords - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];\n        }\n    }\n    FragColor = vec4(result, 1.0);\n}';
        break;
        case 'programs/glow_fragment_shader.frag':
            shaderString = '#version 300 es\nprecision mediump float;\n\nuniform sampler2D uSampler0;\nuniform sampler2D uSampler1;\n\nin vec2 vTextureCoords;\n\nout vec4 fragColor;\n\nvoid main(void) {\n\n    const float gamma = 2.2;\n    vec3 hdrColor = texture(uSampler0, vTextureCoords).rgb;      \n    vec3 bloomColor = texture(uSampler1, vTextureCoords).rgb;\n    hdrColor += bloomColor; \/\/ additive blending\n    \/\/ tone mapping\n    vec3 result = vec3(1.0) - exp(-hdrColor * 1.0);\n    \/\/ also gamma correct while we\'re at it       \n    result = pow(result, vec3(1.0 \/ gamma));\n    fragColor = vec4(result, 1.0);\n\n    \/\/fragColor = texture(uSampler1, vTextureCoords);\n    \/\/fragColor += texture(uSampler1, vTextureCoords);\n    \/\/vec4 frameColor = texture(uSampler, vTextureCoords);\n    \/\/float luminance = frameColor.r * 0.3 + frameColor.g * 0.59 + frameColor.b * 0.11;\n    \/\/fragColor = vec4(luminance, luminance, luminance, frameColor.a);\n}';
        break;
    }
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
    program = await loadProgram('programs/vertex_shader.vert', 'programs/fragment_shader.frag');
    gaussian_blur_program = await loadProgram('programs/post_processing_vexter_shader.vert', 'programs/gaussian_blur.frag');
    ppProgram = await loadProgram('programs/post_processing_vexter_shader.vert', 'programs/glow_fragment_shader.frag');
    
}
