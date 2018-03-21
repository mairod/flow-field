#version 300 es

precision mediump float;

in vec3 vPositiions;
in vec3 vColor;

uniform float uExposure;
uniform float uDiscradius;
uniform float uBorder;
uniform float uHueShift;
uniform float uPostPass;

// uniform float uTime;

out vec4 FRAG_COLOR;

vec3 hueShift( vec3 color, float hueAdjust ){

    const vec3  kRGBToYPrime = vec3 (0.299, 0.587, 0.114);
    const vec3  kRGBToI      = vec3 (0.596, -0.275, -0.321);
    const vec3  kRGBToQ      = vec3 (0.212, -0.523, 0.311);

    const vec3  kYIQToR     = vec3 (1.0, 0.956, 0.621);
    const vec3  kYIQToG     = vec3 (1.0, -0.272, -0.647);
    const vec3  kYIQToB     = vec3 (1.0, -1.107, 1.704);

    float   YPrime  = dot (color, kRGBToYPrime);
    float   I       = dot (color, kRGBToI);
    float   Q       = dot (color, kRGBToQ);
    float   hue     = atan (Q, I);
    float   chroma  = sqrt (I * I + Q * Q);

    hue += hueAdjust;

    Q = chroma * sin (hue);
    I = chroma * cos (hue);

    vec3    yIQ   = vec3 (YPrime, I, Q);

    return vec3( dot (yIQ, kYIQToR), dot (yIQ, kYIQToG), dot (yIQ, kYIQToB) );

}

void main() {

    vec2 uv = gl_PointCoord;
    uv -= vec2(.5);
    float dist = sqrt(dot(uv, uv));
    float t = smoothstep(uDiscradius + uBorder, uDiscradius - uBorder, dist);

    float opacity = smoothstep( 2200., -10., vPositiions.z) * t;
    float offset = smoothstep( 1000., 0., vPositiions.z) * t;
    vec3 color = hueShift(vColor * pow(2.0, uExposure) * t, uHueShift + offset);

    // if(uPostPass > .5){
    //     FRAG_COLOR = vec4( 1. * smoothstep(uDiscradius + uBorder * 5., uDiscradius - uBorder * 5., dist) );
    // } else {
    // }
    
    FRAG_COLOR = vec4( color * pow(opacity, 1.2), opacity );

}