// Starts a WebGL2 render loop that clears to black each frame.
// Returns false if WebGL2 is unavailable (caller shows the fallback).
// Proper DPR/resize handling lands in a later step.
export function startRenderer(canvas: HTMLCanvasElement): boolean {
  const gl = canvas.getContext("webgl2");
  if (!gl) return false;

  const frame = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
}
