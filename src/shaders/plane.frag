#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 FRAG_COLOR;

uniform float uTime;
uniform sampler2D uTexture;

void main() {

    vec2 uv = vUv;
    vec3 color = texture(uTexture, uv).xyz;
    FRAG_COLOR = vec4( color, 1.);

}