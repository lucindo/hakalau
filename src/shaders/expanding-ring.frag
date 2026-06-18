#version 300 es
precision highp float;

// expanding-ring pattern: central fixation dot + a ring expanding outward from
// center past the screen edges, wrapping each cycle.
uniform vec2 u_resolution;
uniform float u_ringPhase;   // 0..1 within the current ring cycle
uniform float u_dotSize;     // dot radius, device px
uniform float u_dotEnabled;  // 0 or 1
uniform float u_ringSoftness; // 0 crisp → 1 soft
uniform float u_ringEnabled;  // 0 once all rounds are done
uniform float u_brightness;   // global fade-out, 1 → 0 on completion
uniform vec3 u_bgColor;       // background
uniform vec3 u_fgColor;       // dot + ring

out vec4 fragColor;

void main() {
  float d = distance(gl_FragCoord.xy, u_resolution * 0.5);

  float dot = 0.0;
  if (u_dotEnabled > 0.5) {
    dot = 1.0 - smoothstep(u_dotSize - 1.0, u_dotSize + 1.0, d);
  }

  // Ring radius sweeps 0 → farthest corner over one cycle, then wraps.
  float maxR = length(u_resolution * 0.5);
  float ringR = u_ringPhase * maxR;
  // Edge falloff: crisp ~1.5px line at softness 0, broad glow at softness 1.
  float edge = mix(1.5, 80.0, u_ringSoftness);
  float ring = (1.0 - smoothstep(0.0, edge, abs(d - ringR))) * u_ringEnabled;

  vec3 color = mix(u_bgColor, u_fgColor, max(dot, ring));
  fragColor = vec4(color * u_brightness, 1.0);
}
