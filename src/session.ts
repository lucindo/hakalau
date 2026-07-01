export interface SessionState {
  cyclesDone: number;
  ringActive: boolean; // is a ring still expanding?
  finished: boolean; // all rounds complete
  brightness: number; // global fade-out multiplier, 1 → 0 after finishing
}

// Fade-out duration after the last round.
export const FADE_SECONDS = 2;

// One round = one ring cycle. rounds === 0 runs endlessly.
export function sessionState(
  elapsedSeconds: number,
  cycleSeconds: number,
  rounds: number,
  fadeSeconds: number,
): SessionState {
  const cyclesDone = Math.floor(elapsedSeconds / cycleSeconds);
  if (rounds === 0 || cyclesDone < rounds) {
    return { cyclesDone, ringActive: true, finished: false, brightness: 1 };
  }
  const brightness = fadeBrightness(elapsedSeconds - rounds * cycleSeconds, fadeSeconds);
  return { cyclesDone, ringActive: false, finished: true, brightness };
}

// Linear fade from 1 to 0 over fadeSeconds — the one fade curve, shared by
// natural completion (above) and an early stop (renderer's stopping mode).
export function fadeBrightness(sinceFadeStartSeconds: number, fadeSeconds: number): number {
  return Math.max(0, 1 - sinceFadeStartSeconds / fadeSeconds);
}

// One-shot latch on session completion: check() returns true only on the first
// frame finished goes true, so the host can trigger end effects (audio fade)
// once instead of every frame. reset() re-arms it for the next session.
export function createFinishLatch(): { check: (finished: boolean) => boolean; reset: () => void } {
  let fired = false;
  return {
    check(finished) {
      if (finished && !fired) {
        fired = true;
        return true;
      }
      return false;
    },
    reset() {
      fired = false;
    },
  };
}
