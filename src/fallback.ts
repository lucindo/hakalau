// Static centered dot shown when WebGL2 is unavailable.
export function showStaticDot(): void {
  const dot = document.createElement("div");
  dot.className = "fallback-dot";
  document.body.appendChild(dot);
}
