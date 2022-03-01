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
    bool growth;
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

    // growth
    vec3 norm = normalize(vNormal);
    float angle = acos(dot(norm, vec3(0.0, 1.0, 0.0)));

    vec3 diffuse_material = uMaterial.diffuse;
    vec3 ambient_material = uMaterial.ambient;

    if (uMaterial.growth) {
        diffuse_material = mix(uMaterial.diffuse, vec3(0.2, 0.3, 0.0), min(0.9, max(0.0, 0.1 / (0.1 + angle))));
        ambient_material = mix(uMaterial.ambient, vec3(0.2, 0.3, 0.0), min(0.9, max(0.0, 0.1 / (0.1 + angle))));
    }

    // combine results
    vec3 ambient  = light.ambient  * ambient_material;
    vec3 diffuse  = light.diffuse  * diff * diffuse_material;
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
        
        //fragColor = vec4(result, 1.0);
        brightColor = vec4(0.0, 0.0, 0.0, 1.0);
        // Depth fog
        float depth = vFragPos.y*-0.05 + 0.1;
        float alpha = min(max(depth, 0.0), 0.7);
        result = mix(result, vec3(0.2, 0.2, 0.1), alpha);

        // Fog-style water
        if (vFragPos.y < 0.9) {
            depth = (vFragPos.z + 0.45) * 0.03;
            alpha = min(max(depth, 0.0), 0.5);
            result = mix(result, vec3(0.0, 0.1, 0.2), alpha);
        }

        fragColor = vec4(result, 1.0);
        
    }
    if (uSelected) {
        fragColor += vec4(0.2, 0.2, 0.4, 1.0);
        brightColor = fragColor;
    }
}
