import { describe, expect, it } from "vitest";
import { sessionState } from "./session";

const PERIOD = 6;

describe("sessionState", () => {
  it("runs endlessly when rounds is 0", () => {
    const s = sessionState(PERIOD * 100, PERIOD, 0);
    expect(s).toEqual({ cyclesDone: 100, ringActive: true, finished: false });
  });

  it("is active during the first cycle", () => {
    expect(sessionState(2, PERIOD, 3)).toMatchObject({ cyclesDone: 0, ringActive: true });
  });

  it("is active mid final cycle", () => {
    // 2.5 cycles in: third (last) ring still expanding
    expect(sessionState(PERIOD * 2.5, PERIOD, 3)).toMatchObject({
      cyclesDone: 2,
      ringActive: true,
      finished: false,
    });
  });

  it("finishes once N cycles complete", () => {
    expect(sessionState(PERIOD * 3, PERIOD, 3)).toEqual({
      cyclesDone: 3,
      ringActive: false,
      finished: true,
    });
  });
});
