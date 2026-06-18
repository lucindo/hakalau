import { createProgram } from "./gl";
import type { FrameContext, Pattern } from "./patterns";
import vertSrc from "./shaders/fullscreen.vert?raw";

// Clamp DPR: fullscreen fragment work at DPR 3 wastes fill rate on phones.
export const deviceDpr = (): number => Math.min(window.devicePixelRatio || 1, 2);

// Advance the ring's cycle phase by dt, wrapping at 1. Wrapping means a
// mid-cycle change to cycleSeconds shifts the rate going forward, not the
// position — otherwise the ring teleports while the cycle slider is dragged.
export const advanceRingPhase = (phase: number, dt: number, cycleSeconds: number): number =>
  (phase + dt / cycleSeconds) % 1;

export interface PatternHost {
  gl: WebGL2RenderingContext; // exposed for viewport sizing by the caller
  bind: (ctx: FrameContext) => void;
  draw: () => void; // clear + draw the fullscreen triangle
}

// Compile a pattern into a canvas's WebGL2 context and return its uniform
// binding plus a draw call. Returns null when WebGL2 is unavailable.
export function createPatternHost(canvas: HTMLCanvasElement, pattern: Pattern): PatternHost | null {
  const gl = canvas.getContext("webgl2");
  if (!gl) return null;
  const program = createProgram(gl, vertSrc, pattern.fragSrc);
  gl.useProgram(program);
  const bind = pattern.createBinding(gl, program);
  return {
    gl,
    bind,
    draw() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
