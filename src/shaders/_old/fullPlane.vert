precision mediump float;

attribute vec3 aPos;
attribute vec3 aUvs;

varying vec3 vUv;

void main(void) {

    vUv = aUvs;

    gl_Position = vec4(aPos, 1.0);
}