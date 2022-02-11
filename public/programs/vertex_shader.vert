#version 300 es
precision mediump float;


uniform mat4 uProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uNormalMatrix;

in vec3 aVertexPosition;
in vec3 aVertexNormal;

out vec3 vFragPos;
out vec3 vNormal;

void main(void) {
    vFragPos = vec3(uModelMatrix * vec4(aVertexPosition, 1.0));

    // Set varyings to be used in fragment shader
    vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));

    gl_Position = uProjectionMatrix * uViewMatrix * vec4(vFragPos, 1.0);
}