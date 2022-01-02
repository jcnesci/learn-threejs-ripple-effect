varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
float PI = 3.141592653589793238;
// uniform float time;
// uniform float progress;
// uniform vec4 resolution;
// varying vec3 vPosition;

void main() {
  // vec4 color = texture2D(uTexture, vUv);
  
  vec4 displacement = texture2D(uDisplacement, vUv);
  float theta = displacement.r * 2. * PI;
  vec2 dir = vec2(sin(theta), cos(theta));
  vec2 uv = vUv + dir * displacement.r * 0.1;
  vec4 color = texture2D(uTexture, uv);

  gl_FragColor = color;
  // gl_FragColor = displacement;  //DEV: for easy debugging
}