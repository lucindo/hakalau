# Plan — Hakalau Meditation Canvas

## Now
**State:** Audio layer shipped (per D12) — all pushed to `origin/main` (`cd26fc6`), Pages deploying.
Self-contained Tone.js subsystem under `src/audio/`, dynamically imported only when Sound is enabled
(base bundle 5.84 KB gz; Tone in a separate ~64 KB chunk). Ocean wide bed + HRTF birds/wind + slow
generative pentatonic pad, fading with the session via the renderer's one-shot `onFinish`. Two
overlay fixes also landed: panel stays open while hovered, and closes cleanly on Start. 15 tests
green, README written.

**Next:** listen on the deployed site and decide if the mix needs another by-ear pass.

**Open questions / deferred:** mix levels by-ear (nature bus 0.22, melody −6 dB, velocity
0.55–0.80); loop seams aren't crossfade-seamless; **leaves** stream deferred (no clean CC0/PD
isolate); headphones hint dropped. Untouched post-v1 items: concurrent rings (ring-count param,
fixed at 1), hyperspace/warp pattern via `src/patterns/`.

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

### Audio layer (per D12 / blueprint)
- [x] Renderer emits a one-shot `onFinish` on session completion; re-arms on restart
- [x] Config persists `audioEnabled` (default off) and `volume`, validated with fallbacks
- [x] Overlay exposes audio enable toggle + volume; persist (live push lands with controller)
- [x] First enabled start dynamically loads Tone + audio controller (base bundle unchanged when off)
- [x] Walking skeleton: one looped nature sample fades in on start, fades out mirroring session fade
- [x] Multi-stream nature bed: ocean (wide floor) + HRTF birds (drifting) + wind; leaves deferred (no clean CC0 isolate)
- [~] Headphones-recommended hint on the start screen — dropped (not wanted)
- [x] Generative melody layer under the streams (bounded scale, slow, no hooks)
- [x] Source CC0/royalty-free samples and bundle as static same-origin assets (ocean CC0, birds/wind PD; leaves pending)
