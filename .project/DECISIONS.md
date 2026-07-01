# Decisions — Hakalau meditation app

## D1 — Rendering technology
**Q:** Crisp ring (CSS/Canvas 2D) vs soft painterly diffusion (WebGL)? Does WebGL run on phones?
**A:** WebGL2, single fullscreen fragment shader. No Three.js.
**Why:** WebGL2 runs well on modern mobile + desktop and is more cross-browser-consistent than
CSS compositor animations. Concentric rings (and future hyperspace/warp) are textbook fragment
shaders; crisp-vs-soft is one `smoothstep` uniform, not a hack. Avoids hitting a CSS/Canvas
ceiling and rewriting. Three.js is unnecessary weight for fullscreen-shader work.

## D2 — Architecture shape
**Q:** Build "an expanding ring," or a more general system?
**A:** A meditation canvas that hosts swappable visual *patterns* (expanding ring, hyperspace
warp, …) over one shared render loop + config system + future audio layer. Ship the expanding
ring as pattern #1; hyperspace and others are future patterns.
**Why:** All patterns share the same goal (radial motion engaging peripheral vision) and the same
plumbing. Pattern-pluggable now avoids a rewrite when adding effects, at little extra cost.

## D3 — Concurrent rings
**Q:** Several staggered rings at once, or one at a time?
**A:** v1 = one ring at a time. Shader written so ring-count is a parameter (sum N ring phases,
N=1 now); concurrent rings is a later config-only change.
**Why:** Whether concurrent rings feel better is a use-it-and-see question, not decidable on paper.
Parameterizing now keeps the door open at no cost.

## D4 — "Velocity" semantics
**Q:** Constant expansion speed (px/s) or constant period (one cycle per N seconds)?
**A:** Constant period, exposed as "cycle duration in seconds." Linear expansion in v1 (no easing).
**Why:** Meditation wants a predictable, screen-independent rhythm that can pair with breath
cadence; px/s would drift cycles-per-minute with screen size.

## D5 — Session end / "rounds"
**Q:** Auto-end after N rounds/minutes, or endless?
**A:** "Rounds" = number of ring cycles; endless is the default (0/off = no limit). On completion,
gentle fade to black, not a hard stop.
**Why:** Period-based timing makes one round = one cycle exact and predictable. Endless suits
open-ended practice; a soft fade avoids a jarring finish.

## D6 — Center point: anchor vs seed
**Q:** Persistent fixation dot, or point-becomes-ring?
**A:** Persistent, subtle central fixation dot (steady gaze anchor) + rings emanating outward from
center. Dot presence/size is a config. Will test both readings (anchor vs point-becomes-ring).
**Why:** Knutson's Hakalau needs a steady point to softly fixate ("look but don't look"); a point
that vanishes leaves no anchor. Config + both-modes keeps the alternative testable.

## D7 — Controls visibility
**Q:** Always-on panel vs hidden/reveal-on-interaction?
**A:** Controls hidden during practice; a click/tap or key-press toggles a settings overlay;
auto-hide after a few seconds of no further interaction. Mouse-move does NOT reveal.
**Why:** Pure dark field is the point; deliberate input (click/key) avoids the twitchy flicker
mouse-move would cause during practice.

## D8 — Framework + deploy
**Q:** Vanilla vs React/Svelte; where to deploy?
**A:** Vanilla TS + Vite, Bun as runtime/pkg manager. Deploy static to GitHub Pages.
**Why:** Render loop is imperative WebGL (no framework benefit); settings overlay is a few inputs
bound to a config object — too small to justify a framework. GitHub Pages fits a static build
(matches the reference). Note: GH Pages serves from a repo subpath, so set Vite `base: '/hakalau/'`.

## D9 — Audio
**Q:** Build audio seams now or defer?
**A:** Defer audio entirely from v1 — no Web Audio code, no abstraction. Only keep the session
lifecycle (start/stop/fade) clean as the future hook point. (Superseded post-v1 by D12.)
**Why:** Simplicity-first; don't build for an unimplemented feature. A clean session lifecycle
(already needed for D5) is the natural attach point later, at zero extra cost now.

## D10 — v1 config surface
**Q:** Which knobs are user-facing in v1?
**A:** Four: cycle duration (s), rounds (cycle count, 0=endless), fixation dot (on/off + size),
ring softness/thickness. Internal-only: ring count (=1), color (white on black).
**Why:** Enough to dial the feel during testing; nothing speculative exposed.

## D11 — Settings persistence
**Q:** Persist settings across reloads?
**A:** Yes — persist config to localStorage, restore on load; defaults on first run.
**Why:** Tiny to implement; once a feel is dialed in, re-entering it every visit is friction.

## D12 — Audio layer (supersedes D9)
**Q:** How to build the post-v1 audio layer — the auditory analog of Hakalau (distinct streams the
listener's attention can float across)?
**A:** A self-contained subsystem under `src/audio/`, wired in at `main.ts`, driven by two discrete
lifecycle events from existing seams: *start* (the "Start session" gesture) and *finish* (renderer
emits a one-shot `onFinish` when a finite session completes). Tone.js for the whole graph, one
shared AudioContext, dynamically imported on first start-with-audio-enabled. Nature streams (ocean,
wind, birds, leaves) = bundled CC0 samples via `Tone.Player`, each HRTF-positioned via
`Tone.Panner3D` (mostly static, ≤1 slow drift); a bounded-scale generative melody runs underneath.
Audio is **decoupled** from the ring rhythm. Fade-in on start; fade-out mirrors the visual
`brightness` ramp (shared `FADE_SECONDS`). Config gains `audioEnabled` (default **off**) + master
`volume`; one curated scene to start (soundscapes pluggable later, pattern-style).
**Why:** Generative melody is the only layer that justifies Tone.js — samples/spatialization are
equally trivial in raw Web Audio — but once Tone is paid for, one paradigm/context beats straddling
raw + Tone. Renderer stays the single source of truth for "session end" (it already reads config
live); audio is told *when*, never recomputes it, so live `rounds`/`cycle` edits can't drift the two
apart. Default-off + dynamic import keep the base bundle untouched for users who never enable sound.
Decoupled because synced swell becomes a beat the mind tracks — the opposite of soft awareness.

## D13 — Bell soundscape strikes once per round (amends D12's decoupling)
**Q:** Should the bell loop freely like the nature bed, or align with the ring?
**A:** Once per round: the renderer emits a per-cycle event (`onCycle`) and the bell retriggers on
it; the garden bed ignores it and stays decoupled. The bell plays raw — unity gain, no fade-in,
no processing; the WAV ships byte-identical to the source.
**Why:** Owner's call after listening — one strike per round "gives a better sensation" (at the
default 25 s cycle the 25 s file chains like a loop). D12's decoupling argument targeted
continuous beds swelling with the ring; a discrete strike marking each round is the intent here,
not an artifact. The renderer stays the single source of cycle timing — audio is told when, so
live cycle/rounds edits and pause/resume can't drift the two apart.

## D14 — Preload all audio at page load (amends D12)
**Q:** Samples downloaded only inside `start()` — after the countdown — so the 4.2MB bell WAV
could stall the first strike on a cold cache. Preload on selection, or unconditionally at load?
**A:** Unconditionally: `warm()` builds both beds at page load; every sample fetches and decodes
up front. Tone remains an async chunk (first paint and base bundle untouched), and `start()`
keeps `Tone.loaded()` as the slow-network safety net.
**Why:** Owner's call — the preload must cover a first-time visitor (default off → picks Bell →
Start), so it can't wait for a persisted choice; the wasted ~6.8MB for visitors who never enable
sound is accepted. Supersedes D12's "sound-off users download nothing" property.

## D15 — Audio failure policy: retry the import, degrade silent on samples
**Q:** A failed Tone-chunk import stuck forever (cached rejected promise) and a failed sample
download rejected `Tone.loaded()` uncaught — sticky-dead audio plus unhandled rejections. More
reachable since D14 moved all downloads to page load. What's the recovery policy?
**A:** Import failure clears the cached promise so the next Start retries; `arm()`/`start()`
failures log one warning and the session runs silent. Deliberately no retry for failed samples.
**Why:** Retrying samples would rebuild the audio graph, re-download ~6.8MB, and orphan the old
Tone nodes (still wired to the destination) — disproportionate for a calm meditation app where
running silent is an acceptable degraded mode. The import retry is free and side-effect-less.

## D16 — Renderer/preview canvas sizing stays duplicated (won't-fix)
**Q:** `renderer.ts` and `preview.ts` duplicate DPR-aware canvas sizing (flagged by the quality
and SSOT reviews). Unify behind a shared `fit()` on the pattern host?
**A:** No — keep both as they are.
**Why:** Unifying forces real semantic changes (window→element sizing, resize-event→per-frame
reads) on an eye-verified renderer; ~10 saved lines don't cover the regression risk. Revisit only
if a third GL surface appears.
