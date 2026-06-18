// Curated background/foreground pairs. Black/White is the high-contrast
// default; the rest are lower-contrast and easier on the eyes for long sits.
// Kutastha evokes the spiritual-eye colors: deep indigo field, golden ring.
export interface ColorPreset {
  name: string;
  bg: string;
  fg: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Black / White", bg: "#000000", fg: "#ffffff" },
  { name: "Kutastha", bg: "#0d1330", fg: "#e6b800" },
  { name: "Slate", bg: "#10141a", fg: "#7f93a8" },
  { name: "Forest", bg: "#0a140e", fg: "#6f9e7a" },
  { name: "Warm Amber", bg: "#1c1206", fg: "#b5803a" },
  { name: "Dim Gray", bg: "#161616", fg: "#7a7a7a" },
];
