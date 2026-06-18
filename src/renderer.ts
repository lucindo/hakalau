import type { Config } from "./config";
import { createProgram } from "./gl";
import { FADE_SECONDS, sessionState } from "./session";
import vertSrc from "./shaders/fullscreen.vert?raw";
import fragSrc from "./shaders/expanding-ring.frag?raw";

// Starts the WebGL2 render loop. Returns false if WebGL2 is unavailable
// (caller shows the fallback).
export function startRenderer(canvas: HTMLCanvasElement, config: Config): boolean {
  const gl = canvas.getContext("webgl2");
  if (!gl) return false;

  const program = createProgram(gl, vertSrc, fragSrc);
  gl.useProgram(program);
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uPeriod = gl.getUniformLocation(program, "u_period");
  const uDotSize = gl.getUniformLocation(program, "u_dotSize");
  const uDotEnabled = gl.getUniformLocation(program, "u_dotEnabled");
  const uRingSoftness = gl.getUniformLocation(program, "u_ringSoftness");
  const uRingEnabled = gl.getUniformLocation(program, "u_ringEnabled");
  const uBrightness = gl.getUniformLocation(program, "u_brightness");
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

  let start: number | null = null;
  const frame = (now: number) => {
    if (start === null) start = now;
    const elapsed = (now - start) / 1000;
    const session = sessionState(elapsed, config.cycleSeconds, config.rounds, FADE_SECONDS);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, elapsed);
    gl.uniform1f(uPeriod, config.cycleSeconds);
    gl.uniform1f(uDotSize, config.dotSize * dpr); // config px → device px
    gl.uniform1f(uDotEnabled, config.dotEnabled ? 1 : 0);
    gl.uniform1f(uRingSoftness, config.ringSoftness);
    gl.uniform1f(uRingEnabled, session.ringActive ? 1 : 0);
    gl.uniform1f(uBrightness, session.brightness);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
}
