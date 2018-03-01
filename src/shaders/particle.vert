#version 300 es

precision mediump float;

in vec3 aPos;

out vec3 vPositiions;
out vec3 vVelocity;

uniform mat4 uMVP;
uniform float uTime;

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

vec3 snoiseVec3( vec3 x ){

  float s  = noise(vec2( x ));
  float s1 = noise(vec2( x.y - 19.1 , x.z + 33.4 ));
  float s2 = noise(vec2( x.z + 74.2 , x.x - 124.5 ));
  vec3 c = vec3( s , s1 , s2 );
  return c;

}

vec3 curlNoise( vec3 p ){
  
  const float e = .1;
  vec3 dx = vec3( e   , 0.0 , 0.0 );
  vec3 dy = vec3( 0.0 , e   , 0.0 );
  vec3 dz = vec3( 0.0 , 0.0 , e   );

  vec3 p_x0 = snoiseVec3( p - dx );
  vec3 p_x1 = snoiseVec3( p + dx );
  vec3 p_y0 = snoiseVec3( p - dy );
  vec3 p_y1 = snoiseVec3( p + dy );
  vec3 p_z0 = snoiseVec3( p - dz );
  vec3 p_z1 = snoiseVec3( p + dz );

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / ( 2.0 * e );
  return normalize( vec3( x , y , z ) * divisor );

}

const vec3 wind = vec3( .8, .8, 1.2);

void main(void) {

    vec3 pos = aPos;

    vec3 disp = curlNoise(vec3(pos.xy + wind.xy, pos.z + uTime + wind.z) * .006);

    vVelocity = normalize(disp);

    pos += disp;
    pos.z += 1.5;

    float dir = -1.;
    if(pos.x > .5) {
        dir = 1.;
    } 

    float shift = pow(smoothstep( 0., 50. * dir, pos.x), 2.);
    // pos.x += shift;
    
    float scale = smoothstep( 400., -10., pos.z);
    float fadeIn = smoothstep( 0., 20., pos.z);

    vPositiions = pos;
    gl_PointSize = 3. * scale;
    gl_Position = uMVP * vec4(pos, 1.0);

}