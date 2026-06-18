import { describe, expect, it } from "vitest";
import { createFinishLatch, sessionState, stopFadeBrightness } from "./session";

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

describe("stopFadeBrightness", () => {
  it("fades 1 → 0 over fadeSeconds and clamps", () => {
    expect(stopFadeBrightness(0, FADE)).toBe(1);
    expect(stopFadeBrightness(FADE / 2, FADE)).toBeCloseTo(0.5);
    expect(stopFadeBrightness(FADE, FADE)).toBe(0);
    expect(stopFadeBrightness(FADE * 3, FADE)).toBe(0); // clamped
  });
});

describe("createFinishLatch", () => {
  it("fires once on completion, not every frame", () => {
    const latch = createFinishLatch();
    expect(latch.check(false)).toBe(false); // running
    expect(latch.check(true)).toBe(true); // crossed into finished
    expect(latch.check(true)).toBe(false); // still finished, already fired
    expect(latch.check(true)).toBe(false);
  });

  it("re-arms after reset for the next session", () => {
    const latch = createFinishLatch();
    latch.check(true);
    latch.reset();
    expect(latch.check(true)).toBe(true);
  });
});
