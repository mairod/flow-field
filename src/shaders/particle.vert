#version 300 es

precision mediump float;

in vec3 aPos;

uniform mat4 uMVP;

void main(void) {

    gl_PointSize = 3.;
    gl_Position = uMVP * vec4(aPos, 1.0);

}