import * as v from "valibot";

// dotSize and ringSoftness units: dot radius in CSS px; softness 0 (crisp) → 1 (soft).
// Colors are "#rrggbb"; fgColor paints both the dot and the ring.
// fallback() yields per-field defaults when a value is missing or out of range.
const hexColor = v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}$/i));

export const SOUNDSCAPES = ["off", "garden", "bell"] as const;
export type Soundscape = (typeof SOUNDSCAPES)[number];

// Shared with the overlay's sliders so UI range and stored-value validation
// can't drift — an out-of-range save would silently reset to the default.
export const CONFIG_BOUNDS = {
  cycleSeconds: { min: 0.5, max: 60 },
  dotSize: { min: 1, max: 40 },
  ringSoftness: { min: 0, max: 1 },
  volume: { min: 0, max: 1 },
} as const;

const bounded = (b: { min: number; max: number }, fallback: number) =>
  v.fallback(v.pipe(v.number(), v.minValue(b.min), v.maxValue(b.max)), fallback);

const ConfigSchema = v.object({
  cycleSeconds: bounded(CONFIG_BOUNDS.cycleSeconds, 25),
  rounds: v.fallback(v.pipe(v.number(), v.integer(), v.minValue(0)), 0),
  dotEnabled: v.fallback(v.boolean(), true),
  dotSize: bounded(CONFIG_BOUNDS.dotSize, 5),
  ringSoftness: bounded(CONFIG_BOUNDS.ringSoftness, 0.1),
  bgColor: v.fallback(hexColor, "#000000"),
  fgColor: v.fallback(hexColor, "#ffffff"),
  soundscape: v.fallback(v.picklist(SOUNDSCAPES), "off"),
  volume: bounded(CONFIG_BOUNDS.volume, 0.5),
});

export type Config = v.InferOutput<typeof ConfigSchema>;

export const DEFAULT_CONFIG: Config = v.parse(ConfigSchema, {});

const STORAGE_KEY = "hakalau.config";

export function loadConfig(): Config {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return { ...DEFAULT_CONFIG };
  try {
    const data: unknown = JSON.parse(raw);
    // Configs saved before the soundscape dropdown stored an `audioEnabled`
    // boolean; enabled meant the nature bed, which is now "garden".
    if (typeof data === "object" && data !== null && !("soundscape" in data)) {
      const legacy = data as Record<string, unknown>;
      if (legacy.audioEnabled === true) legacy.soundscape = "garden";
    }
    return v.parse(ConfigSchema, data);
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
