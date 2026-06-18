import type { AudioController } from "./audio/controller";
import type { Config } from "./config";
import { showStaticDot } from "./fallback";
import { createConfigPanel } from "./overlay";
import { getPattern } from "./patterns";
import { startPreview } from "./preview";
import { startRenderer } from "./renderer";

const COUNTDOWN_FROM = 3;

type Screen = "config" | "countdown" | "running" | "paused" | "ending";

// Owns the session flow: config → countdown → running → (paused) → fade → config.
export function startApp(canvas: HTMLCanvasElement, config: Config): void {
  // Tone + the controller load only when audio is used, keeping it out of the
  // base bundle. Warmed on enable so the gesture is ready when Start is pressed.
  let audio: AudioController | null = null;
  let loading: Promise<AudioController> | null = null;
  const ensureAudio = (): Promise<AudioController> => {
    if (!loading) {
      loading = import("./audio/controller").then((m) => {
        audio = m.createAudioController();
        return audio;
      });
    }
    return loading;
  };

  const pattern = getPattern("expanding-ring");
  const handle = startRenderer(
    canvas,
    config,
    pattern,
    () => {
      audio?.finish();
      if (screen === "running" || screen === "paused") setScreen("ending");
    },
    () => setScreen("config"),
  );
  if (!handle) {
    canvas.remove();
    showStaticDot();
    return;
  }
  const renderer = handle;
  if (config.audioEnabled) void ensureAudio();

  const panel = createConfigPanel(config, {
    onStart: startCountdown,
    onAudioChange: () => {
      if (config.audioEnabled) void ensureAudio();
      audio?.setMuted(!config.audioEnabled);
      audio?.setVolume(config.volume);
    },
  });
  const previewCanvas = document.createElement("canvas");
  previewCanvas.className = "preview";
  const configScreen = document.createElement("div");
  configScreen.className = "config";
  configScreen.append(panel, previewCanvas);

  const countdown = createCountdown();
  const pausePrompt = createPausePrompt({ onContinue: resume, onStop: stop });
  document.body.append(configScreen, countdown.el, pausePrompt.el);
  startPreview(previewCanvas, config, pattern);

  let screen: Screen = "config";
  const setScreen = (next: Screen): void => {
    screen = next;
    configScreen.hidden = next !== "config";
    countdown.el.hidden = next !== "countdown";
    pausePrompt.el.hidden = next !== "paused";
  };
  setScreen("config");

  function startCountdown(): void {
    if (config.audioEnabled) void ensureAudio().then((a) => a.arm());
    // Cover the idle dot with the session background so the numeral stands
    // alone; matching bg makes the cut into the running session seamless.
    countdown.el.style.background = config.bgColor;
    countdown.el.style.color = config.fgColor;
    setScreen("countdown");
    countdown.run(COUNTDOWN_FROM, begin);
  }

  function begin(): void {
    setScreen("running");
    renderer.restart();
    if (config.audioEnabled) void ensureAudio().then((a) => a.start(config));
  }

  function resume(): void {
    if (screen !== "paused") return;
    renderer.resume();
    audio?.setMuted(false);
    setScreen("running");
  }

  function stop(): void {
    if (screen !== "paused") return;
    renderer.stop(); // fade out, then onFadeComplete → config
  }

  // A click during practice pauses everything; settings are reachable only from
  // the config screen now.
  window.addEventListener("pointerdown", () => {
    if (screen !== "running") return;
    renderer.pause();
    audio?.setMuted(true);
    setScreen("paused");
  });
}

function createCountdown(): { el: HTMLElement; run: (from: number, done: () => void) => void } {
  const el = document.createElement("div");
  el.className = "countdown";
  el.hidden = true;
  return {
    el,
    run(from, done) {
      let n = from;
      el.textContent = String(n);
      const tick = (): void => {
        n -= 1;
        if (n <= 0) {
          done();
          return;
        }
        el.textContent = String(n);
        window.setTimeout(tick, 1000);
      };
      window.setTimeout(tick, 1000);
    },
  };
}

function createPausePrompt(handlers: { onContinue: () => void; onStop: () => void }): {
  el: HTMLElement;
} {
  const el = document.createElement("div");
  el.className = "pause";
  el.hidden = true;

  const card = document.createElement("div");
  card.className = "pause__card";

  const cont = document.createElement("button");
  cont.type = "button";
  cont.className = "pause__btn pause__btn--primary";
  cont.textContent = "Continue";
  cont.addEventListener("click", handlers.onContinue);

  const stop = document.createElement("button");
  stop.type = "button";
  stop.className = "pause__btn";
  stop.textContent = "Stop";
  stop.addEventListener("click", handlers.onStop);

  card.append(cont, stop);
  el.appendChild(card);

  // Backdrop click resumes. Stop propagation so it doesn't bubble to the
  // window pause handler, which would re-pause the instant we resumed. Button
  // clicks must not reach the backdrop either.
  card.addEventListener("pointerdown", (e) => e.stopPropagation());
  el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    handlers.onContinue();
  });

  return { el };
}
