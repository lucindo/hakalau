# Plan — Hakalau Meditation Canvas

## Roadmap

- [ ] Project scaffolds: Vite + TS + Bun builds and serves a blank full-screen black page
- [ ] WebGL2 context initializes on a fullscreen canvas; no-WebGL2 path shows a static centered dot
- [ ] Canvas tracks viewport resize and device pixel ratio; stays full-screen and centered
- [ ] Typed config object with defaults; validates and loads from localStorage, persists on change
- [ ] Fragment shader renders a centered fixation dot (size configurable, on/off)
- [ ] Shader renders a single ring expanding from center past the edges on a constant period
- [ ] Ring cycle duration matches configured seconds independent of viewport size
- [ ] Ring edge softness/thickness driven by config without altering cycle timing
- [ ] Session runs N rounds (1 round = 1 cycle); rounds=0 runs endlessly
- [ ] Session fades to black on reaching the round count instead of stopping abruptly
- [ ] Settings overlay hidden during practice; toggles on click/tap or key-press; auto-hides after inactivity; ignores mouse-move
- [ ] Overlay exposes the four controls; changes apply to the running animation live
- [ ] Pattern registered behind a pluggable interface (host owns GL/loop/session); expanding-ring is the only pattern
- [ ] Vitest covers config validation/persistence and session/round logic
- [ ] Builds with base '/hakalau/' and deploys to GitHub Pages
