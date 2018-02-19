#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec2 vUv;
const float division = 30.;

void main() {

    vec2 uv = vUv.xy * division;

    gl_FragColor = vec4(vUv, 1. ,1.);
}