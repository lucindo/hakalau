import { type Config, saveConfig } from "./config";

// Settings panel. Hidden during practice; revealed by deliberate input
// (click/tap or key) and auto-hidden after inactivity. Mouse-move must NOT
// reveal it — that would flicker the chrome constantly during practice.
// Controls mutate the shared config in place; the renderer reads it by
// reference each frame, so changes apply live.
const AUTO_HIDE_MS = 3000;

export function createOverlay(config: Config): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "overlay";

  addRange(panel, "Cycle (s)", 0.5, 60, 0.5, config.cycleSeconds, (v) => {
    config.cycleSeconds = v;
    saveConfig(config);
  });
  addNumber(panel, "Rounds (0 = endless)", config.rounds, (v) => {
    config.rounds = v;
    saveConfig(config);
  });
  addCheckbox(panel, "Fixation dot", config.dotEnabled, (v) => {
    config.dotEnabled = v;
    saveConfig(config);
  });
  addRange(panel, "Dot size", 1, 40, 1, config.dotSize, (v) => {
    config.dotSize = v;
    saveConfig(config);
  });
  addRange(panel, "Ring softness", 0, 1, 0.01, config.ringSoftness, (v) => {
    config.ringSoftness = v;
    saveConfig(config);
  });

  document.body.appendChild(panel);

  let hideTimer = 0;
  const show = () => {
    panel.classList.add("overlay--visible");
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => panel.classList.remove("overlay--visible"), AUTO_HIDE_MS);
  };
  window.addEventListener("pointerdown", show);
  window.addEventListener("keydown", show);
  panel.addEventListener("input", show); // keep panel alive while adjusting

  return panel;
}

function addRow(parent: HTMLElement, label: string, input: HTMLElement): HTMLLabelElement {
  const row = document.createElement("label");
  row.className = "overlay__row";
  const name = document.createElement("span");
  name.textContent = label;
  row.append(name, input);
  parent.appendChild(row);
  return row;
}

function addRange(
  parent: HTMLElement,
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
  onChange: (v: number) => void,
): void {
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  const out = document.createElement("span");
  out.className = "overlay__value";
  out.textContent = String(value);
  input.addEventListener("input", () => {
    const v = Number(input.value);
    out.textContent = String(v);
    onChange(v);
  });
  addRow(parent, label, input).append(out);
}

function addNumber(
  parent: HTMLElement,
  label: string,
  value: number,
  onChange: (v: number) => void,
): void {
  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.step = "1";
  input.value = String(value);
  input.addEventListener("input", () => {
    const v = Math.floor(Number(input.value));
    if (Number.isFinite(v) && v >= 0) onChange(v);
  });
  addRow(parent, label, input);
}

function addCheckbox(
  parent: HTMLElement,
  label: string,
  value: boolean,
  onChange: (v: boolean) => void,
): void {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = value;
  input.addEventListener("change", () => onChange(input.checked));
  addRow(parent, label, input);
}
