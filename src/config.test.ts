import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG, loadConfig, saveConfig } from "./config";

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
});
