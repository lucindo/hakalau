# Plan — Hakalau Meditation Canvas

## Now
**State:** On `main`, clean and fully pushed; deploy live. Audio preload shipped (PR #6, verified
by owner): `warm()` builds both beds at page load so all samples (bell 4.2MB + garden 2.6MB)
fetch+decode before Start — every visitor pays the download, even with sound off (D14, amends
D12). Tone stays an async chunk; first paint and base bundle unchanged. Bell asset is the owner's
WAV byte-identical — never re-encode or process it. Spatial 3D bed remains abandoned on local
`spatial-bed` (Panner3D collapses stereo beds; would need ambisonics to revisit).

**Next:** none committed — pick a deferred item.

**Open questions:** keep or delete the local `spatial-bed` branch? Deferred: preview dot/ring render
bold (faithful scaling needs a shader change); concurrent rings; hyperspace/warp pattern.

**Watch:** `PROJECT.md` repo map is broadly stale — missing `src/app.ts`, `src/preview.ts`,
`src/glHost.ts`, `src/audio/`, `public/audio/` (drift from PRs #2–#4) — run `/ds-project-map`.
Tone gotcha worth remembering: `Source.restart()` silently no-ops on a stopped one-shot; retrigger
via `player.start()`.

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
- [x] Multi-stream nature bed: ocean (wide floor) + HRTF birds (drifting) + wind + leaves (aspen, drifting)
- [x] Seamless loops: baked tail→head crossfade in each asset replaces the loop:true silence dip
- [~] Headphones-recommended hint on the start screen — dropped (not wanted)
- [x] Generative melody layer under the streams (bounded scale, slow, no hooks)
- [x] Source CC0/royalty-free samples and bundle as static same-origin assets (ocean CC0; birds/wind/leaves PD Mark)
- [~] Spatial 3D roaming bed (per-source HRTF) — built on `spatial-bed`, abandoned: collapses stereo width, sounds thinner

### Session flow rework (branch `session-flow`)
- [x] Renderer lifecycle: `pause`/`resume`/`stop` (early fade) + `onFadeComplete`; idle frame = dot only
- [x] App screen state machine in `src/app.ts`: config → countdown → running → paused → fade → config
- [x] 3·2·1 countdown over the session background (themed, no dot bleed-through)
- [x] Click-to-pause mid-session with Continue (or backdrop) / Stop; pause mutes audio
- [x] Boxed live preview (`src/preview.ts`, second WebGL2 context) beside the controls
- [x] Audio `arm()` resumes the context on the Start gesture, before the post-countdown `start()`
- [x] Crossfades between screens (`.screen`); single-source `glHost.ts`, `.card`/`--brand` tokens
- [x] Push branch + open PR to `main` (merged via PR #2)

### Soundscape dropdown (Off / Garden / Bell)
- [x] Config replaces `audioEnabled` with a validated soundscape choice (off/garden/bell); legacy `audioEnabled: true` migrates to garden
- [x] Bell asset ships in `public/audio/bell.wav`: owner's BELL2.wav byte-identical (authored as a seamless loop; lossy re-encode would pad the seam), credited in CREDITS.md
- [x] Audio controller plays the selected soundscape via lazy per-bed buses: Garden = streams + melody (keeps its fade-in), Bell = bell alone, unity gain, instant entry — no processing of any kind
- [x] Bell strikes once per round (D13): renderer emits `onCycle` on each ring-cycle wrap; controller retriggers the bell, garden ignores it
- [x] Overlay replaces the audio toggle with a soundscape dropdown; selection persists, sound plays only during a session (audition on the config screen was tried and dropped)
- [x] Tests cover soundscape validation and the boolean→choice migration
- [x] Verify by ear (`bun run dev`): bell strikes clean once per round and chains seamlessly at 25 s cycles — confirmed by owner
- [x] Fix (PR #5): bell retriggers via `player.start()` (Tone `restart()` no-ops on a stopped one-shot → bell died after first play); bed switch hard-zeroes the outgoing bus (ramp leaked a ~1 s garden tail once master came up) — verified by owner
- [x] Preload (PR #6): `warm()` builds both beds at page load — all samples fetch+decode up front so Start never waits on the network (D14); selection-time warm removed — verified by owner
