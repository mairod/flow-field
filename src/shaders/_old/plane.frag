#extension GL_OES_standard_derivatives : enable

precision mediump float;

varying vec3 vUv;
const float division = 30.;

void main() {

    vec2 uv = vUv.xy * division;

    // Compute anti-aliased world-space grid lines
    vec2 grid = abs(fract(uv - 0.5) - 0.5) / fwidth(uv);
    float line = min(grid.x, grid.y);

    // Just visualize the grid lines directly
    vec3 color = vec3(1.0 - min(line, 1.0));

    gl_FragColor = vec4(color,1.);
}