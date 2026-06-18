import type { Config } from "./config";
import { createProgram } from "./gl";
import type { Pattern } from "./patterns";
import vertSrc from "./shaders/fullscreen.vert?raw";

// Always-looping miniature of the pattern for the config screen. Its own WebGL2
// context; reads config by reference so slider edits show live. No session or
// fade — it just runs the ring continuously so the user sees timing and colors.
const PREVIEW_SESSION = { cyclesDone: 0, ringActive: true, finished: false, brightness: 1 };

export function startPreview(canvas: HTMLCanvasElement, config: Config, pattern: Pattern): void {
  const gl = canvas.getContext("webgl2");
  if (!gl) return; // main renderer already gated WebGL2; nothing to show here
  const program = createProgram(gl, vertSrc, pattern.fragSrc);
  gl.useProgram(program);
  const bind = pattern.createBinding(gl, program);

  let dpr = 1;
  const resize = (): void => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  let last: number | null = null;
  let ringPhase = 0;
  const frame = (now: number): void => {
    if (last !== null) ringPhase = (ringPhase + (now - last) / 1000 / config.cycleSeconds) % 1;
    last = now;
    resize();
    bind({ resolution: [canvas.width, canvas.height], dpr, ringPhase, config, session: PREVIEW_SESSION });
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
