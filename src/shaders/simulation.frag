#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 FRAG_COLOR;

uniform float uTime;
uniform float uVoxelDim;
uniform vec2 uRez;

void main() {

    vec2 uv = vUv;

    vec3 pos = vec3(uv.x, uv.y, 0.);

    FRAG_COLOR = vec4( pos, 1.);

}