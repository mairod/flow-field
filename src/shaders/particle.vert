#version 300 es

precision mediump float;

in vec3 aPos;
in vec3 aDirs;
in vec3 aColors;

out vec3 vPositiions;
out vec3 vColor;

uniform mat4 uMVP;
uniform float uTime;
uniform float uDpr;
uniform float uSize;
uniform float uPostPass;


void main(void) {

    vec3 pos = aPos;

    float dir = -1.;
    if(pos.x > .5) {
        dir = 1.;
    } 
    
    float scale         = smoothstep( 1000., -10., pos.z);
    float vel           = smoothstep( 1200., -10., pos.z);

    pos.z += 7. * (pow(vel, .5) + .01);
    pos.y +=  .02 * pos.z; 
    pos.y = min(pos.y, 300.);

    pos += aDirs * 3.;

    vPositiions = pos;
    vColor      = aColors;
    if(uPostPass > .5){
        gl_PointSize = 30.;
    } else {
        gl_PointSize = 2.5 * scale * uDpr * uSize;
    }
    gl_Position = uMVP * vec4(pos, 1.0);


}