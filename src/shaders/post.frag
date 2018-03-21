#version 300 es

precision mediump float;

in vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uRez;

uniform float uBlurX;
uniform float uBlurY;
uniform float uBrigth;

out vec4 FRAG_COLOR;

vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture(image, uv) * 0.1964825501511404;
  color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}


void main() {

    vec2 uv = vec2(vUv.x, -vUv.y);

    vec4 base = texture(uTexture, uv);
    vec4 blur = blur13(uTexture, uv, uRez, vec2(uBlurX, uBlurY)) * .7;
    blur += blur13(uTexture, uv, uRez, vec2(uBlurY * 2., uBlurX * 2.)) * .3;

    // vec4 color = texture(uTexture, uv);
    FRAG_COLOR = blur;

}