import { type Config, saveConfig } from "./config";
import { COLOR_PRESETS } from "./presets";

// Settings panel. Hidden during practice; revealed by deliberate input
// (click/tap or key) and auto-hidden after inactivity. Mouse-move must NOT
// reveal it — that would flicker the chrome constantly during practice.
// Controls mutate the shared config in place; the renderer reads it by
// reference each frame, so changes apply live.
const AUTO_HIDE_MS = 3000;

export interface OverlayHandlers {
  onStart: () => void; // "Start session" pressed
  onAudioChange: () => void; // audio enable/volume edited (already persisted)
}

export function createOverlay(config: Config, handlers: OverlayHandlers): HTMLElement {
  const panel = document.createElement("div");
  panel.className = "overlay";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "overlay__close";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Close settings");
  panel.appendChild(closeBtn);

  const startBtn = document.createElement("button");
  startBtn.type = "button";
  startBtn.className = "overlay__start";
  startBtn.textContent = "Start session";
  panel.appendChild(startBtn);

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
  // Preset picker drives both swatches; editing a swatch flips it to "Custom".
  const presetOptions = [
    ...COLOR_PRESETS.map((p, i) => ({ value: String(i), label: p.name })),
    { value: "custom", label: "Custom" },
  ];
  const currentPreset = () => {
    const i = COLOR_PRESETS.findIndex((p) => p.bg === config.bgColor && p.fg === config.fgColor);
    return i === -1 ? "custom" : String(i);
  };

  let bgInput: HTMLInputElement;
  let fgInput: HTMLInputElement;

  const presetSelect = addSelect(panel, "Preset", presetOptions, currentPreset(), (val) => {
    const preset = COLOR_PRESETS[Number(val)];
    if (!preset) return; // "custom" — leave the swatches as they are
    config.bgColor = preset.bg;
    config.fgColor = preset.fg;
    bgInput.value = preset.bg;
    fgInput.value = preset.fg;
    saveConfig(config);
  });

  bgInput = addColor(panel, "Background", config.bgColor, (v) => {
    config.bgColor = v;
    presetSelect.value = currentPreset();
    saveConfig(config);
  });
  fgInput = addColor(panel, "Dot / ring", config.fgColor, (v) => {
    config.fgColor = v;
    presetSelect.value = currentPreset();
    saveConfig(config);
  });

  addCheckbox(panel, "Sound", config.audioEnabled, (v) => {
    config.audioEnabled = v;
    saveConfig(config);
    handlers.onAudioChange();
  });
  addRange(panel, "Volume", 0, 1, 0.01, config.volume, (v) => {
    config.volume = v;
    saveConfig(config);
    handlers.onAudioChange();
  });

  document.body.appendChild(panel);

  let hideTimer = 0;
  const hide = () => {
    clearTimeout(hideTimer);
    panel.classList.remove("overlay--visible");
  };
  const armHide = () => {
    clearTimeout(hideTimer);
    hideTimer = window.setTimeout(hide, AUTO_HIDE_MS);
  };
  const show = () => {
    panel.classList.add("overlay--visible");
    armHide();
  };
  closeBtn.addEventListener("click", hide);
  // Restart timing from zero and clear the chrome so practice resumes unobstructed.
  startBtn.addEventListener("click", () => {
    handlers.onStart();
    hide();
  });
  window.addEventListener("pointerdown", show);
  window.addEventListener("keydown", (e) => (e.key === "Escape" ? hide() : show()));
  panel.addEventListener("input", show); // keep panel alive while adjusting
  // Don't time out while the pointer rests on the panel (e.g. reading the options).
  panel.addEventListener("pointerenter", () => clearTimeout(hideTimer));
  // Re-arm the countdown on leave, but don't re-reveal — otherwise closing the
  // panel (Start/close) slides it out from under the pointer and pops it back.
  panel.addEventListener("pointerleave", armHide);

  // Show controls on load and leave them pinned until the user starts a session.
  panel.classList.add("overlay--visible");

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

function addColor(
  parent: HTMLElement,
  label: string,
  value: string,
  onChange: (v: string) => void,
): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "color";
  input.value = value;
  input.addEventListener("input", () => onChange(input.value));
  addRow(parent, label, input);
  return input;
}

function addSelect(
  parent: HTMLElement,
  label: string,
  options: ReadonlyArray<{ value: string; label: string }>,
  value: string,
  onChange: (v: string) => void,
): HTMLSelectElement {
  const select = document.createElement("select");
  for (const opt of options) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    select.appendChild(o);
  }
  select.value = value;
  select.addEventListener("change", () => onChange(select.value));
  addRow(parent, label, select);
  return select;
}
