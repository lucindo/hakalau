// Starts a WebGL2 render loop that clears to black each frame.
// Returns false if WebGL2 is unavailable (caller shows the fallback).
export function startRenderer(canvas: HTMLCanvasElement): boolean {
  const gl = canvas.getContext("webgl2");
  if (!gl) return false;

  const resize = () => {
    // Clamp DPR: fullscreen fragment work at DPR 3 wastes fill rate on phones.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  const frame = () => {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
}
