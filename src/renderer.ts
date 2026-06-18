import type { Config } from "./config";
import { createProgram } from "./gl";
import type { Pattern } from "./patterns";
import { FADE_SECONDS, sessionState } from "./session";
import vertSrc from "./shaders/fullscreen.vert?raw";

// Host for a visual pattern: owns the WebGL2 context, canvas sizing, render
// loop, and session timing. Returns false if WebGL2 is unavailable (caller
// shows the fallback).
export function startRenderer(canvas: HTMLCanvasElement, config: Config, pattern: Pattern): boolean {
  const gl = canvas.getContext("webgl2");
  if (!gl) return false;

  const program = createProgram(gl, vertSrc, pattern.fragSrc);
  gl.useProgram(program);
  const bind = pattern.createBinding(gl, program);
  gl.clearColor(0, 0, 0, 1);

  let dpr = 1;
  const resize = () => {
    // Clamp DPR: fullscreen fragment work at DPR 3 wastes fill rate on phones.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  resize();
  window.addEventListener("resize", resize);

  let last: number | null = null;
  let elapsed = 0; // seconds since start, for session timing
  // Ring phase advances by Δt each frame so a mid-cycle change to cycleSeconds
  // shifts the rate going forward, not the current position — otherwise the
  // ring teleports while the cycle slider is dragged.
  let ringPhase = 0;
  const frame = (now: number) => {
    if (last !== null) {
      const dt = (now - last) / 1000;
      elapsed += dt;
      ringPhase = (ringPhase + dt / config.cycleSeconds) % 1;
    }
    last = now;
    const session = sessionState(elapsed, config.cycleSeconds, config.rounds, FADE_SECONDS);
    bind({ resolution: [canvas.width, canvas.height], dpr, ringPhase, config, session });
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
}
