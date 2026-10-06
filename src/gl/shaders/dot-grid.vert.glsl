uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uSpan;
uniform float uSpacing;
uniform float uPixelRatio;
varying float vLift;
varying float vWave;

void main() {
  vec3 p = position;
  p.y = mod(p.y + uScroll * 0.25, uSpan) - uSpacing;

  float d = distance(p.xy, uMouse);
  float lift = smoothstep(190.0, 0.0, d);
  vec2 away = d > 0.001 ? (p.xy - uMouse) / d : vec2(0.0);
  p.xy += away * lift * 16.0;

  float wave = sin(p.x * 0.011 + uTime * 0.55) * cos(p.y * 0.009 - uTime * 0.35);
  vLift = lift;
  vWave = wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = (1.7 + lift * 3.2 + wave * 0.45) * uPixelRatio;
}
