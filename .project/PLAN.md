# Plan — Hakalau Meditation Canvas

## Now
**State:** Session-flow rework done on branch `session-flow` (8 commits, not yet pushed). Replaced
the auto-hiding side panel with an explicit screen state machine in `src/app.ts`: config (settings +
boxed live preview) → 3·2·1 countdown → running → click-to-pause (Continue/Stop) → fade → back to
config. Renderer gained `pause/resume/stop` + `onFadeComplete`; `src/preview.ts` runs a second WebGL2
context for the live preview; GL bootstrap/DPR/phase deduped into `src/glHost.ts`; CSS crossfades via
`.screen`, shared `.card` + `--brand` tokens. Audio gained `arm()` to resume the context on the Start
gesture (session start is 3s later, past the gesture window). Code-review (risk: low) + deslop passes
done. 16 tests green, build clean, base bundle 6.53 KB gz.

**Next:** push `session-flow` and open a PR to `main` (CI deploys to Pages on merge).

**Open questions / deferred:** preview dot/ring render bold (absolute device-px) — left as-is, faithful
scaling needs a shader change; final visual pass on countdown/pause feel pending user. Carried over:
mix levels by-ear; loop seams not crossfade-seamless; **leaves** stream deferred; concurrent rings and
hyperspace/warp pattern still untouched post-v1.

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

### Session flow rework (branch `session-flow`)
- [x] Renderer lifecycle: `pause`/`resume`/`stop` (early fade) + `onFadeComplete`; idle frame = dot only
- [x] App screen state machine in `src/app.ts`: config → countdown → running → paused → fade → config
- [x] 3·2·1 countdown over the session background (themed, no dot bleed-through)
- [x] Click-to-pause mid-session with Continue (or backdrop) / Stop; pause mutes audio
- [x] Boxed live preview (`src/preview.ts`, second WebGL2 context) beside the controls
- [x] Audio `arm()` resumes the context on the Start gesture, before the post-countdown `start()`
- [x] Crossfades between screens (`.screen`); single-source `glHost.ts`, `.card`/`--brand` tokens
- [ ] Push branch + open PR to `main`
