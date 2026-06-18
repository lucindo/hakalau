import { expandingRing } from "./expanding-ring";
import type { Pattern } from "./pattern";

export type { FrameContext, Pattern } from "./pattern";

const patterns: Record<string, Pattern> = {
  [expandingRing.id]: expandingRing,
};

export function getPattern(id: string): Pattern {
  const pattern = patterns[id];
  if (!pattern) throw new Error(`unknown pattern: ${id}`);
  return pattern;
}
