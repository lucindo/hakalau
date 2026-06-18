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
lifecycle (start/stop/fade) clean as the future hook point.
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
