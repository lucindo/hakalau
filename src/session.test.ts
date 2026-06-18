import { describe, expect, it } from "vitest";
import { sessionState } from "./session";

const PERIOD = 6;
const FADE = 2;

describe("sessionState", () => {
  it("runs endlessly when rounds is 0", () => {
    expect(sessionState(PERIOD * 100, PERIOD, 0, FADE)).toEqual({
      cyclesDone: 100,
      ringActive: true,
      finished: false,
      brightness: 1,
    });
  });

  it("is active during the first cycle", () => {
    expect(sessionState(2, PERIOD, 3, FADE)).toMatchObject({ cyclesDone: 0, ringActive: true });
  });

  it("is active mid final cycle", () => {
    expect(sessionState(PERIOD * 2.5, PERIOD, 3, FADE)).toMatchObject({
      cyclesDone: 2,
      ringActive: true,
      finished: false,
      brightness: 1,
    });
  });

  it("finishes at full brightness the instant the last cycle completes", () => {
    expect(sessionState(PERIOD * 3, PERIOD, 3, FADE)).toEqual({
      cyclesDone: 3,
      ringActive: false,
      finished: true,
      brightness: 1,
    });
  });

  it("ramps brightness to 0 over the fade window", () => {
    expect(sessionState(PERIOD * 3 + FADE / 2, PERIOD, 3, FADE).brightness).toBeCloseTo(0.5);
    expect(sessionState(PERIOD * 3 + FADE, PERIOD, 3, FADE).brightness).toBe(0);
    expect(sessionState(PERIOD * 3 + FADE * 5, PERIOD, 3, FADE).brightness).toBe(0); // clamped
  });
});
