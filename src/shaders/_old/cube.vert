precision mediump float;

attribute vec3 aPos;
attribute vec3 aUvs;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;

varying vec3 vUv;

void main(void) {

    vUv = aUvs;

    gl_PointSize = 20.;
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aPos, 1.0);
}