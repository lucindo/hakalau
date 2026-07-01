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
  // Tone + the controller stay a separate async chunk so the first paint is
  // never blocked, but everything preloads at page load: all samples fetch and
  // decode up front so Start never waits on the network (owner's call — the
  // download is paid even if sound stays off).
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
    () => audio?.cycle(),
  );
  if (!handle) {
    canvas.remove();
    showStaticDot();
    return;
  }
  const renderer = handle;
  void ensureAudio().then((a) => a.warm());

  const panel = createConfigPanel(config, {
    onStart: startCountdown,
    onVolumeChange: () => audio?.setVolume(config.volume),
  });
  const previewCanvas = document.createElement("canvas");
  previewCanvas.className = "preview";
  const configScreen = document.createElement("div");
  configScreen.className = "config screen";
  configScreen.append(panel, previewCanvas);

  const countdown = createCountdown();
  const pausePrompt = createPausePrompt({ onContinue: resume, onStop: stop });
  document.body.append(configScreen, countdown.el, pausePrompt.el);
  startPreview(previewCanvas, config, pattern);

  let screen: Screen = "config";
  const setScreen = (next: Screen): void => {
    screen = next;
    configScreen.classList.toggle("screen--on", next === "config");
    countdown.el.classList.toggle("screen--on", next === "countdown");
    pausePrompt.el.classList.toggle("screen--on", next === "paused");
  };
  setScreen("config");

  function startCountdown(): void {
    if (config.soundscape !== "off") void ensureAudio().then((a) => a.arm());
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
    if (config.soundscape !== "off") void ensureAudio().then((a) => a.start(config));
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

  // Settings live on the config screen; during practice a click only pauses.
  window.addEventListener("pointerdown", () => {
    if (screen !== "running") return;
    renderer.pause();
    audio?.setMuted(true);
    setScreen("paused");
  });
}

function createCountdown(): { el: HTMLElement; run: (from: number, done: () => void) => void } {
  const el = document.createElement("div");
  el.className = "countdown screen";
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
  el.className = "pause screen";

  const card = document.createElement("div");
  card.className = "pause__card card";

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
