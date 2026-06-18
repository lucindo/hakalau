#version 300 es
precision highp float;

// expanding-ring pattern. Draws the central fixation dot; the expanding ring
// itself lands in the next step.
uniform vec2 u_resolution;
uniform float u_dotSize;     // dot radius, device px
uniform float u_dotEnabled;  // 0 or 1

out vec4 fragColor;

void main() {
  float v = 0.0;
  if (u_dotEnabled > 0.5) {
    float d = distance(gl_FragCoord.xy, u_resolution * 0.5);
    v = 1.0 - smoothstep(u_dotSize - 1.0, u_dotSize + 1.0, d);
  }
  fragColor = vec4(vec3(v), 1.0);
}
