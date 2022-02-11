#version 300 es
precision mediump float;

#define numLights 4

struct PointLight {
    vec3 position;
    
    float constant;
    float linear;
    float quadratic;  

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
    bool isLight;
};

uniform vec3 uCameraPos;
uniform uint uIdColor;
uniform int uNumLights;
uniform bool uDebug;
uniform bool uSelected;
uniform PointLight uLight[numLights];
uniform Material uMaterial;

in vec3 vFragPos;
in vec3 vNormal;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 brightColor;
layout(location = 2) out uint idColor;

vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    // diffuse shading
    float diff = max(dot(normal, lightDir), 0.0);
    // specular shading
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), uMaterial.shininess);
    // attenuation
    float distance    = length(light.position - fragPos);
    float attenuation = 1.0 / (light.constant + light.linear * distance + 
  			     light.quadratic * (distance * distance));    
    // combine results
    vec3 ambient  = light.ambient  * uMaterial.ambient;
    vec3 diffuse  = light.diffuse  * diff * uMaterial.diffuse;
    vec3 specular = light.specular * spec * uMaterial.specular;
    ambient  *= attenuation;
    diffuse  *= attenuation;
    specular *= attenuation;
    return (ambient + diffuse + specular);
} 


void main() {
    idColor = uIdColor;
    if (uDebug){
        fragColor = vec4(1.0, 0.0, 1.0, 1.0);
        brightColor = fragColor;
    } else if (uMaterial.isLight) {
        fragColor = vec4(uMaterial.diffuse, 1.0);
        brightColor = fragColor;
    } else {
        // properties
        vec3 norm = normalize(vNormal);
        vec3 viewDir = normalize(uCameraPos - vFragPos);

        vec3 result = vec3(0); 
        // phase 2: Point lights
        for(int i = 0; i < uNumLights; i++)
            result += CalcPointLight(uLight[i], norm, vFragPos, viewDir);
        
        fragColor = vec4(result, 1.0);
        brightColor = vec4(0.0, 0.0, 0.0, 1.0);
        //float depth = vFragPos.y*-0.1 + 0.2;
        //float alpha = min(max(depth, 0.0), 1.0);
        //fragColor = vec4(mix(result, vec3(0.1, 0.2, 0.5), alpha), 1.0);
    }
    if (uSelected) {
        fragColor += vec4(0.2, 0.2, 0.4, 1.0);
        brightColor = fragColor;
    }
}
