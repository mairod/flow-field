precision mediump float;

uniform sampler2D uTexture;
varying vec3 vUv;

void main() {

    // vec3 color = vec3(vUv.x, vUv.y, 0.);

    // vec3 color = vec3(0., 0., 0.);
    // if(vUv.z == 0.){ color = vec3(1., 0., 0.); }
    // else if(vUv.z == 1.){ color = vec3(0., 1., 0.); }
    // else if(vUv.z == 2.){ color = vec3(0., 0., 1.); }
    // else if(vUv.z == 3.){ color = vec3(1., 1., 0.); }
    // else if(vUv.z == 4.){ color = vec3(1., 0., 1.); }
    // else if(vUv.z == 5.){ color = vec3(0., 1., 1.); }

    vec3 color = texture2D( uTexture, vUv.xy ).xyz;
    gl_FragColor = vec4(color,1.);

}