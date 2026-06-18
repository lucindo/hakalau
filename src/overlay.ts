// Settings panel container. Hidden during practice; revealed by deliberate
// input (click/tap or key) and auto-hidden after inactivity. Mouse-move must
// NOT reveal it — that would flicker the chrome constantly during practice.
const AUTO_HIDE_MS = 3000;

export function createOverlay(): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "overlay";
  document.body.appendChild(panel);

  let hideTimer = 0;
  const show = () => {
    panel.classList.add("overlay--visible");
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => panel.classList.remove("overlay--visible"), AUTO_HIDE_MS);
  };

  window.addEventListener("pointerdown", show);
  window.addEventListener("keydown", show);

  return panel;
}
