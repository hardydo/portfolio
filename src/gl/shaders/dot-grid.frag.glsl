uniform vec3 uColor;
uniform vec3 uAccent;
varying float vLift;
varying float vWave;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  vec3 color = mix(uColor, uAccent, vLift);
  float alpha = 0.09 + 0.07 * (vWave * 0.5 + 0.5) + vLift * 0.6;
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
}
