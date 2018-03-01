#version 300 es

precision mediump float;

in vec3 vPositiions;
in vec3 vVelocity;

out vec4 FRAG_COLOR;

void main() {

    vec4 color = vec4( 1.);
    color *= smoothstep( 400., -10., vPositiions.z);
    FRAG_COLOR = vec4( color );

}