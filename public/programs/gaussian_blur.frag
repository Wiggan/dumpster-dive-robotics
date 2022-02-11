#version 300 es
precision mediump float;

out vec4 FragColor;
  
in vec2 vTextureCoords;

uniform sampler2D image;
  
uniform bool horizontal;
float weight[5];

void main()
{             
    weight[0] = 0.227027;
    weight[1] = 0.1945946;
    weight[2] = 0.1216216;
    weight[3] = 0.054054;
    weight[4] = 0.016216;
    vec2 tex_offset = vec2(1) / vec2(textureSize(image, 0)); // gets size of single texel
    vec3 result = texture(image, vTextureCoords).rgb * weight[0]; // current fragment's contribution
    if(horizontal)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, vTextureCoords + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
            result += texture(image, vTextureCoords - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(image, vTextureCoords + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
            result += texture(image, vTextureCoords - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
        }
    }
    FragColor = vec4(result, 1.0);
}