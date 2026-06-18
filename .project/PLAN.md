# Plan — Hakalau Meditation Canvas

## Now
**State:** v1 complete on branch `ring-v1` — all 15 roadmap items done, 10 unit tests green,
build clean (11 KB JS / 4.2 KB gz). Decisions in `.project/DECISIONS.md`, spec in `.project/SPEC.md`.
Tuned defaults set: cycle 25 s, rounds 0 (endless), dot on @ 5 px, softness 0.1.

**Next:** open PR `ring-v1` → `main`; after merge, enable GitHub Pages (Settings → Pages →
Source: GitHub Actions) so the deploy workflow publishes to https://lucindo.github.io/hakalau/.

**Open questions / deferred (post-v1):** audio (3D nature/ocean — keep session start/stop as the
hook); concurrent rings (ring-count param already in shader, fixed at 1); hyperspace/warp pattern
(add via the pattern registry); tune defaults further by feel.

## Roadmap

- [x] Project scaffolds: Vite + TS + Bun builds and serves a blank full-screen black page
- [x] WebGL2 context initializes on a fullscreen canvas; no-WebGL2 path shows a static centered dot
- [x] Canvas tracks viewport resize and device pixel ratio; stays full-screen and centered
- [x] Typed config object with defaults; validates and loads from localStorage, persists on change
- [x] Fragment shader renders a centered fixation dot (size configurable, on/off)
- [x] Shader renders a single ring expanding from center past the edges on a constant period
- [x] Ring cycle duration matches configured seconds independent of viewport size
- [x] Ring edge softness/thickness driven by config without altering cycle timing
- [x] Session runs N rounds (1 round = 1 cycle); rounds=0 runs endlessly
- [x] Session fades to black on reaching the round count instead of stopping abruptly
- [x] Settings overlay hidden during practice; toggles on click/tap or key-press; auto-hides after inactivity; ignores mouse-move
- [x] Overlay exposes the four controls; changes apply to the running animation live
- [x] Pattern registered behind a pluggable interface (host owns GL/loop/session); expanding-ring is the only pattern
- [x] Vitest covers config validation/persistence and session/round logic
- [x] Builds with base '/hakalau/' and deploys to GitHub Pages
