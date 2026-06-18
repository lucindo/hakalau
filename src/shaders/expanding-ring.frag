#version 300 es
precision highp float;

// expanding-ring pattern: central fixation dot + a ring expanding outward from
// center past the screen edges, repeating every u_period seconds.
uniform vec2 u_resolution;
uniform float u_time;        // seconds since start
uniform float u_period;      // seconds per ring cycle
uniform float u_dotSize;     // dot radius, device px
uniform float u_dotEnabled;  // 0 or 1

out vec4 fragColor;

void main() {
  float d = distance(gl_FragCoord.xy, u_resolution * 0.5);

  float dot = 0.0;
  if (u_dotEnabled > 0.5) {
    dot = 1.0 - smoothstep(u_dotSize - 1.0, u_dotSize + 1.0, d);
  }

  // Ring radius sweeps 0 → farthest corner over one period, then wraps.
  float maxR = length(u_resolution * 0.5);
  float ringR = fract(u_time / u_period) * maxR;
  float ringWidth = 3.0; // device px; configurable softness lands next step
  float ring = 1.0 - smoothstep(ringWidth, ringWidth + 2.0, abs(d - ringR));

  fragColor = vec4(vec3(max(dot, ring)), 1.0);
}
