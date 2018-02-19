precision mediump float;

uniform sampler2D uTexture;
uniform float uTime;

varying vec3 vUv;
const float division = 30.;
vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(12.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

void main() {

    vec2 uv = vUv.xy;
    float t = 1.0 - sin(uTime*.1)*5.;
    uv += noise(uv*3.)*t;

    vec3 color = texture2D( uTexture, uv ).xyz;
    color *= length(uv);
    gl_FragColor = vec4(color,1.);
}