import type { Config } from "./config";
import { advanceRingPhase, createPatternHost, deviceDpr } from "./glHost";
import type { Pattern } from "./patterns";
import {
  createFinishLatch,
  FADE_SECONDS,
  type SessionState,
  sessionState,
  stopFadeBrightness,
} from "./session";

export interface RendererHandle {
  restart: () => void; // start (or restart) a session, resetting timing to zero
  pause: () => void; // freeze the clock (mid-session)
  resume: () => void; // continue from where pause froze
  stop: () => void; // end early: fade out from now, then go idle
}

// Idle/countdown frame: fixation dot over the background, no ring, no fade.
const IDLE_SESSION: SessionState = {
  cyclesDone: 0,
  ringActive: false,
  finished: false,
  brightness: 1,
};

// Host for a visual pattern: owns the WebGL2 context, canvas sizing, render
// loop, and session timing. Returns null if WebGL2 is unavailable (caller
// shows the fallback).
export function startRenderer(
  canvas: HTMLCanvasElement,
  config: Config,
  pattern: Pattern,
  onFinish?: () => void, // fires once at fade start (finish or stop); re-arms on restart
  onFadeComplete?: () => void, // fires once when the fade reaches full background
): RendererHandle | null {
  const host = createPatternHost(canvas, pattern);
  if (!host) return null;
  const { gl } = host;
  gl.clearColor(0, 0, 0, 1);

  let dpr = 1;
  const resize = () => {
    dpr = deviceDpr();
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

  type Mode = "idle" | "running" | "paused" | "stopping";
  let mode: Mode = "idle";
  let last: number | null = null;
  let elapsed = 0; // seconds since start, for session timing
  let stopElapsed = 0; // elapsed at the moment stop() was called
  let ringPhase = 0;
  const finishLatch = createFinishLatch();
  let fadeDone = false; // one-shot guard for onFadeComplete

  const frame = (now: number) => {
    const advancing = mode === "running" || mode === "stopping";
    if (advancing && last !== null) {
      const dt = (now - last) / 1000;
      elapsed += dt;
      ringPhase = advanceRingPhase(ringPhase, dt, config.cycleSeconds);
    }
    last = now;

    let session: SessionState;
    if (mode === "stopping") {
      const brightness = stopFadeBrightness(elapsed - stopElapsed, FADE_SECONDS);
      session = { cyclesDone: 0, ringActive: false, finished: true, brightness };
    } else if (mode === "idle") {
      session = IDLE_SESSION;
    } else {
      session = sessionState(elapsed, config.cycleSeconds, config.rounds, FADE_SECONDS);
      if (finishLatch.check(session.finished)) onFinish?.();
    }

    // When an ending session reaches full background, fire once and go idle.
    if (advancing && session.finished && session.brightness <= 0 && !fadeDone) {
      fadeDone = true;
      mode = "idle";
      onFadeComplete?.();
    }

    host.bind({ resolution: [canvas.width, canvas.height], dpr, ringPhase, config, session });
    host.draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return {
    restart: () => {
      mode = "running";
      elapsed = 0;
      ringPhase = 0;
      stopElapsed = 0;
      fadeDone = false;
      finishLatch.reset();
    },
    pause: () => {
      if (mode === "running") mode = "paused";
    },
    resume: () => {
      if (mode === "paused") mode = "running";
    },
    stop: () => {
      if (mode !== "running" && mode !== "paused") return;
      mode = "stopping";
      stopElapsed = elapsed;
      onFinish?.(); // mirror the audio fade-out
    },
  };
}
