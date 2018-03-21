#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 FRAG_COLOR;

const float division = 50.;

void main() {

    vec2 circleUv = vUv -.5;
    float dist = sqrt(dot(circleUv, circleUv));
    float t = pow(smoothstep(.4, .1, dist), 1.5);

    vec2 uv = vUv.xy * division;
    vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float line = min(grid.x, grid.y);
    
    FRAG_COLOR = vec4(1.0 - min(line, 1.0)) * t * .6;

}