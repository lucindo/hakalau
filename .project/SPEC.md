# Specification: Hakalau Meditation Canvas (v1 — Expanding Ring)

## Problem
Hakalau (per Forrest Knutson) trains peripheral vision: softly fixate a point while absorbing
the visual field's edges — "look, but don't look." Practitioners have no simple visual aid for
this. This is a full-screen dark web page that anchors the gaze on a central point while rings
emanate outward past the screen edges, drawing attention into the periphery. v1 ships one visual
pattern (the expanding ring); the system is built to host more patterns later.

## Scope
**In scope (v1)**
- Full-screen dark canvas rendering a persistent central fixation dot + outward-expanding rings.
- WebGL2 fullscreen fragment shader; one pattern (`expanding-ring`).
- Settings overlay with four controls; config persisted to localStorage.
- Session lifecycle: start, run for N rounds or endlessly, gentle fade to black on completion.
- Static deploy to GitHub Pages.

**Out of scope (v1, deferred)**
- Audio of any kind (background / 3D nature / ocean).
- Additional patterns (e.g. hyperspace/warp), though the architecture must accommodate them.
- Concurrent rings on screen (ring-count parameterized internally, fixed at 1).
- Breath-pacing sync, accounts, analytics, any backend.

## Users
- **Practitioner** — opens the page and meditates. Needs: a calm dark field, a steady point to
  fixate, smooth outward ring motion, and unobtrusive control over speed / rounds / dot / ring
  softness. Wants their dialed-in settings remembered.

## Functional Requirements
- **FR-1:** The system SHALL render a full-screen black background with no persistent UI chrome
  while a session runs.
- **FR-2:** The system SHALL render a central fixation dot when the dot setting is enabled, at the
  configured size, fixed at screen center for the session's duration.
- **FR-3:** The system SHALL render rings that originate at screen center and expand outward at a
  constant period until they pass beyond all screen edges.
- **FR-4:** The system SHALL complete exactly one ring cycle per the configured cycle duration
  (seconds), independent of viewport size.
- **FR-5:** The system SHALL render one ring at a time in v1 (ring count fixed at 1), with ring
  count implemented as an internal parameter.
- **FR-6:** The system SHALL render ring edges per the configured softness/thickness, from crisp
  to soft, without changing the cycle timing.
- **FR-7:** The system SHALL run for the configured number of rounds, where one round = one ring
  cycle; when rounds = 0 it SHALL run endlessly until stopped.
- **FR-8:** On reaching the configured round count, the system SHALL fade the screen to black
  rather than stopping abruptly.
- **FR-9:** The system SHALL keep the settings overlay hidden during practice.
- **FR-10:** The system SHALL toggle the settings overlay on a click/tap or key-press, and SHALL
  auto-hide it after a period of no further interaction.
- **FR-11:** The system SHALL NOT reveal the overlay in response to mouse movement.
- **FR-12:** The settings overlay SHALL expose exactly four controls: cycle duration (seconds),
  rounds (cycle count, 0 = endless), fixation dot (on/off + size), ring softness/thickness.
- **FR-13:** The system SHALL apply control changes to the running animation without a page reload.
- **FR-14:** The system SHALL persist the current config to localStorage and restore it on load;
  on first run (no stored config) it SHALL apply defaults.
- **FR-15:** The animation SHALL adapt to viewport resize and device pixel ratio, keeping the dot
  centered and rings circular.
- **FR-16:** Visual patterns SHALL be pluggable behind a common interface (render loop, config,
  session lifecycle), with `expanding-ring` as the only registered pattern in v1.

## Non-Functional Requirements
- **NFR-1:** Frame timing: P99 frame time ≤ 16.7 ms (≥ 60 fps, or device refresh rate) on a
  mid-range 2021+ smartphone and on desktop Chrome/Firefox/Safari.
- **NFR-2:** Scale: fully client-side static assets; no backend; concurrency bounded only by the
  CDN (GitHub Pages).
- **NFR-3:** Availability: equal to GitHub Pages hosting; no app-owned services.
- **NFR-4:** Data retention: config stored only in browser localStorage; no PII; zero network
  calls after asset load.
- **NFR-5:** Cross-browser: functions on current Chrome, Firefox, Safari (desktop + mobile,
  iOS 15+). On WebGL2 absence, SHALL degrade to a static centered dot (no crash).
- **NFR-6:** Bundle: initial load (JS+shader, gzipped) ≤ 150 KB; no Three.js.

## Interfaces
- **Entry:** single static page served at the GitHub Pages base path (`/hakalau/`).
- **Pattern interface (internal):** a pattern exposes a fragment shader + uniform mapping from the
  shared config; the host owns the GL context, render loop, and session lifecycle.
- **Config (boundary):** a typed config object `{ cycleSeconds, rounds, dotEnabled, dotSize,
  ringSoftness }` serialized to/from localStorage as JSON.
- **External systems:** none.

## Constraints
- Language/runtime: TypeScript 5+, targeting browser (ES2022). Bun for tooling.
- Build: Vite, with `base: '/hakalau/'` for GitHub Pages subpath.
- Rendering: raw WebGL2 fullscreen fragment shader. Forbidden: Three.js; CSS/Canvas-2D as the
  primary renderer; any backend or network dependency at runtime.
- Validate the localStorage-loaded config at the boundary (untrusted/stale shape) before use;
  fall back to defaults on invalid data.

## Acceptance Criteria
- **AC-1:** Given the page is open and a session running, when observed, then the screen is black
  with no visible UI chrome. *(FR-1, FR-9)*
- **AC-2:** Given the dot is enabled at size S, when a session runs, then a dot of size S stays at
  exact screen center for the whole session; when disabled, no dot renders. *(FR-2)*
- **AC-3:** Given a running session, when observed over time, then rings begin at center and expand
  outward until past all edges, repeating. *(FR-3)*
- **AC-4:** Given cycle duration = T s on two different viewport sizes, when timed, then one ring
  cycle takes T s (±5%) on both. *(FR-4)*
- **AC-5:** Given default settings, when observed at any instant, then at most one ring is visible.
  *(FR-5)*
- **AC-6:** Given softness changed from crisp to soft, when applied, then ring edge blur changes
  while cycle duration stays T s. *(FR-6, FR-13)*
- **AC-7:** Given rounds = N (N>0), when the session runs, then after N cycles the screen has faded
  to black and no new ring starts. *(FR-7, FR-8)*
- **AC-8:** Given rounds = 0, when the session runs past many cycles, then rings continue
  indefinitely until stopped. *(FR-7)*
- **AC-9:** Given a session running with overlay hidden, when the user clicks/taps or presses a
  key, then the overlay appears; after the inactivity period it hides again. *(FR-10)*
- **AC-10:** Given the overlay hidden, when the mouse moves without clicking, then the overlay
  stays hidden. *(FR-11)*
- **AC-11:** Given the overlay open, when inspected, then exactly the four specified controls are
  present. *(FR-12)*
- **AC-12:** Given any control is changed, when applied, then the animation updates live with no
  page reload. *(FR-13)*
- **AC-13:** Given settings changed then the page reloaded, when the page loads, then the changed
  settings are restored; clearing localStorage then reloading restores defaults. *(FR-14)*
- **AC-14:** Given a running session, when the window is resized or moved between displays of
  different DPR, then the dot stays centered and rings stay circular and smooth. *(FR-15)*
- **AC-15:** Given a browser without WebGL2, when the page loads, then a static centered dot shows
  and no error is thrown. *(NFR-5)*
- **AC-16:** Given corrupt/partial JSON in localStorage, when the page loads, then defaults apply
  and no error surfaces to the user. *(Constraints — boundary validation, FR-14)*
- **AC-17:** Given the running app on a mid-range phone, when frame time is measured, then P99
  ≤ 16.7 ms over a 30 s sample. *(NFR-1)*

### Coverage
- FR-1 → AC-1
- FR-2 → AC-2
- FR-3 → AC-3
- FR-4 → AC-4
- FR-5 → AC-5
- FR-6 → AC-6
- FR-7 → AC-7, AC-8
- FR-8 → AC-7
- FR-9 → AC-1
- FR-10 → AC-9
- FR-11 → AC-10
- FR-12 → AC-11
- FR-13 → AC-6, AC-12
- FR-14 → AC-13, AC-16
- FR-15 → AC-14
- FR-16 → (architectural; exercised indirectly via AC-3..AC-6 — no standalone runtime test in v1)

## Technical Profile
- Language: TypeScript 5+ (browser, ES2022), `strict` + `noUncheckedIndexedAccess`.
- Runtime target: modern browsers, WebGL2.
- Build toolchain: Vite + Bun; static output to GitHub Pages (`base: '/hakalau/'`).
- Testing: Vitest (config validation, session/round logic, pattern registry). Visual/timing
  behavior (AC-3, AC-4, AC-7, AC-14, AC-17) verified manually or via Playwright if added later.

## Open Questions
- OQ-1: Default values for the four controls (cycle duration, rounds, dot size, softness)? Pick
  sensible starting values during build, tune by feel.
- OQ-2: Inactivity period before the overlay auto-hides (e.g. 3 s)? Pick a default during build.
- OQ-3: Fade-out duration on session completion (FR-8)? Pick a default during build.
- OQ-4: Ring color fixed white in v1 — confirm no per-session brightness/intensity control is
  wanted yet. (Assumed: no.)
