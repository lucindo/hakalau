export interface SessionState {
  cyclesDone: number;
  ringActive: boolean; // is a ring still expanding?
  finished: boolean; // all rounds complete
  brightness: number; // global fade-out multiplier, 1 → 0 after finishing
}

// Fade-out duration after the last round (OQ-3 default).
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
  const sinceEnd = elapsedSeconds - rounds * cycleSeconds;
  const brightness = Math.max(0, 1 - sinceEnd / fadeSeconds);
  return { cyclesDone, ringActive: false, finished: true, brightness };
}
