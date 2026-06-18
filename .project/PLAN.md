# Plan — Hakalau Meditation Canvas

## Now
**State:** v1 + post-v1 polish live at https://lucindo.github.io/hakalau/. This session added three
changes, committed and ready to push: session-end fade resolves to the chosen bg color (not black);
deliberate start — the page loads idle (controls pinned, static dot, time not advancing) and a "Start
session" button begins the run, hides the panel, and restarts after a fade-out (no page reload). 12
unit tests green, build ~5 KB JS gz.

**Next:** push to `main` → Pages deploys automatically. Then pick a post-v1 item below.

**Open questions / deferred (post-v1):** audio (3D nature/ocean — session start/stop is the hook);
concurrent rings (ring-count param in shader, fixed at 1); hyperspace/warp pattern (add via
`src/patterns/` registry); further default tuning by feel.

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
- [x] Ring driven by a continuous phase accumulator — cycle changes alter rate, not position
- [x] Panel polish: close button + Esc, slide-in transition, frosted/cleaner look
- [x] User-selectable background and dot/ring colors, persisted and validated
- [x] Color preset dropdown (Black/White default, Kutastha, low-contrast options)
- [x] Session-end fade resolves to the chosen background color instead of black
- [x] Deliberate start: idle on load, "Start session" begins/restarts a session without page reload
