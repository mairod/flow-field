#version 300 es

precision mediump float;

in vec3 aPos;
in vec2 aUvs;

out vec2 vUv;

void main(void) {

    vUv = aUvs;

    gl_Position = vec4(aPos, 1.0);
}