precision mediump float;

attribute vec3 aPos;
attribute vec2 aUvs;

uniform mat4 uMMatrix;
uniform mat4 uVMatrix;
uniform mat4 uPMatrix;
uniform float uTime;

uniform sampler2D uHeightMap;

varying vec2 vUv;

void main(void) {

    vUv = aUvs;

    float displacement = texture2D( uHeightMap, aUvs ).x;
    vec3 pos = aPos;
    pos.y += displacement * (.8 + cos(uTime)*.1);

    gl_PointSize = displacement * 3.;
    gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(pos, 1.0);
}