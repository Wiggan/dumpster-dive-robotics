#version 300 es
precision mediump float;

uniform sampler2D uSampler0;
uniform sampler2D uSampler1;

in vec2 vTextureCoords;

out vec4 fragColor;

void main(void) {

    const float gamma = 2.2;
    vec3 hdrColor = texture(uSampler0, vTextureCoords).rgb;      
    vec3 bloomColor = texture(uSampler1, vTextureCoords).rgb;
    hdrColor += bloomColor; // additive blending
    // tone mapping
    vec3 result = vec3(1.0) - exp(-hdrColor * 1.0);
    // also gamma correct while we're at it       
    result = pow(result, vec3(1.0 / gamma));
    fragColor = vec4(result, 1.0);

    //fragColor = texture(uSampler1, vTextureCoords);
    //fragColor += texture(uSampler1, vTextureCoords);
    //vec4 frameColor = texture(uSampler, vTextureCoords);
    //float luminance = frameColor.r * 0.3 + frameColor.g * 0.59 + frameColor.b * 0.11;
    //fragColor = vec4(luminance, luminance, luminance, frameColor.a);
}