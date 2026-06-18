export interface SessionState {
  cyclesDone: number;
  ringActive: boolean; // is a ring still expanding?
  finished: boolean; // all rounds complete
}

// One round = one ring cycle. rounds === 0 runs endlessly.
export function sessionState(
  elapsedSeconds: number,
  cycleSeconds: number,
  rounds: number,
): SessionState {
  const cyclesDone = Math.floor(elapsedSeconds / cycleSeconds);
  if (rounds === 0) {
    return { cyclesDone, ringActive: true, finished: false };
  }
  const finished = cyclesDone >= rounds;
  return { cyclesDone, ringActive: !finished, finished };
}
