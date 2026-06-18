import * as v from "valibot";

// dotSize and ringSoftness units: dot radius in CSS px; softness 0 (crisp) → 1 (soft).
// Colors are "#rrggbb"; fgColor paints both the dot and the ring.
// fallback() yields per-field defaults when a value is missing or out of range.
const hexColor = v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}$/i));
const ConfigSchema = v.object({
  cycleSeconds: v.fallback(v.pipe(v.number(), v.minValue(0.5), v.maxValue(60)), 25),
  rounds: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
  dotEnabled: v.fallback(v.boolean(), true),
  dotSize: v.fallback(v.pipe(v.number(), v.minValue(1), v.maxValue(40)), 5),
  ringSoftness: v.fallback(v.pipe(v.number(), v.minValue(0), v.maxValue(1)), 0.1),
  bgColor: v.fallback(hexColor, "#000000"),
  fgColor: v.fallback(hexColor, "#ffffff"),
  audioEnabled: v.fallback(v.boolean(), false),
  volume: v.fallback(v.pipe(v.number(), v.minValue(0), v.maxValue(1)), 0.5),
});

export type Config = v.InferOutput<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = v.parse(ConfigSchema, {});

const STORAGE_KEY = "hakalau.config";

export function loadConfig(): Config {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return { ...DEFAULT_CONFIG };
  try {
    return v.parse(ConfigSchema, JSON.parse(raw));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Config): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// "#rrggbb" → [r, g, b] in 0..1 for GL uniforms. Input is schema-validated.
export function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
