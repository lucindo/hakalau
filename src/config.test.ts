import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG, hexToRgb, loadConfig, saveConfig } from "./config";

function mockLocalStorage(): void {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, val: string) => void store.set(k, val),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
}

beforeEach(mockLocalStorage);
afterEach(() => vi.unstubAllGlobals());

describe("config persistence", () => {
  it("returns defaults when nothing is stored", () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("round-trips a saved config", () => {
    const cfg = { ...DEFAULT_CONFIG, cycleSeconds: 10, rounds: 5, dotEnabled: false };
    saveConfig(cfg);
    expect(loadConfig()).toEqual(cfg);
  });

  it("falls back to defaults on corrupt JSON", () => {
    localStorage.setItem("hakalau.config", "{not json");
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("defaults only the invalid fields, keeps valid ones", () => {
    localStorage.setItem(
      "hakalau.config",
      JSON.stringify({ cycleSeconds: 999, rounds: 3, ringSoftness: "soft" }),
    );
    const cfg = loadConfig();
    expect(cfg.cycleSeconds).toBe(DEFAULT_CONFIG.cycleSeconds); // out of range → default
    expect(cfg.ringSoftness).toBe(DEFAULT_CONFIG.ringSoftness); // wrong type → default
    expect(cfg.rounds).toBe(3); // valid → kept
  });

  it("falls back to defaults when stored value is not an object", () => {
    localStorage.setItem("hakalau.config", "42");
    expect(loadConfig()).toEqual(DEFAULT_CONFIG);
  });

  it("defaults soundscape off and clamps out-of-range volume", () => {
    expect(DEFAULT_CONFIG.soundscape).toBe("off");
    localStorage.setItem(
      "hakalau.config",
      JSON.stringify({ soundscape: "bell", volume: 5 }),
    );
    const cfg = loadConfig();
    expect(cfg.soundscape).toBe("bell"); // valid → kept
    expect(cfg.volume).toBe(DEFAULT_CONFIG.volume); // out of range → default
  });

  it("rejects an unknown soundscape", () => {
    localStorage.setItem("hakalau.config", JSON.stringify({ soundscape: "rain" }));
    expect(loadConfig().soundscape).toBe("off");
  });

  it("migrates the legacy audioEnabled boolean", () => {
    localStorage.setItem("hakalau.config", JSON.stringify({ audioEnabled: true }));
    expect(loadConfig().soundscape).toBe("garden");
    localStorage.setItem("hakalau.config", JSON.stringify({ audioEnabled: false }));
    expect(loadConfig().soundscape).toBe("off");
  });

  it("prefers an explicit soundscape over the legacy flag", () => {
    localStorage.setItem(
      "hakalau.config",
      JSON.stringify({ audioEnabled: true, soundscape: "bell" }),
    );
    expect(loadConfig().soundscape).toBe("bell");
  });

  it("keeps valid hex colors and rejects malformed ones", () => {
    localStorage.setItem(
      "hakalau.config",
      JSON.stringify({ bgColor: "#1a2b3c", fgColor: "red" }),
    );
    const cfg = loadConfig();
    expect(cfg.bgColor).toBe("#1a2b3c"); // valid hex → kept
    expect(cfg.fgColor).toBe(DEFAULT_CONFIG.fgColor); // not #rrggbb → default
  });
});

describe("hexToRgb", () => {
  it("maps #rrggbb to 0..1 channels", () => {
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#ffffff")).toEqual([1, 1, 1]);
    expect(hexToRgb("#ff8000")).toEqual([1, 128 / 255, 0]);
  });
});
