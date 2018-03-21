#version 300 es

precision mediump float;

in vec3 aPos;
in vec2 aUvs;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;

out vec2 vUv;

void main(void) {

    vUv = aUvs;

    gl_PointSize = 20.;
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aPos, 1.0);
}