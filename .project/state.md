# now
v1.0.0 shipped and live on Pages: expanding-ring canvas, garden/bell soundscapes, Mono Zen dark chrome; nothing in flight.

# next
Pick from the deferred pool in PLAN.md — concurrent rings, hyperspace/warp pattern, Mono Zen markup polish, faithful preview scaling.

# settled
- Renderer is a raw WebGL2 fullscreen fragment shader — Three.js and CSS/Canvas-2D-as-primary are forbidden.
- Vanilla TS + Vite + Bun; no UI framework.
- No backend, accounts, analytics, or third-party runtime service; config lives only in localStorage.
- Initial load stays under 150 KB gzipped.
- New visual patterns plug in via `src/patterns/`; the renderer host stays pattern-agnostic.
- Stored config is validated at the localStorage boundary with per-field fallbacks; never trust the stored shape.
- Missing WebGL2 degrades to a static centered dot, never a crash.
- The renderer is the single source of session and cycle timing; audio is told when and never recomputes it.
- Garden stays decoupled from the ring; only the bell tracks it, one strike per round.
- Audio preloads unconditionally at page load — the ~6.8 MB cost for sound-off visitors is accepted.
- Failed audio samples get no retry; the session runs silent.
- Renderer and preview keep their duplicated DPR sizing; revisit only if a third GL surface appears.
- UI chrome is Mono Zen dark tokens only — no teal, no light theme, no theme switch; canvas colors stay user-configured.
- Countdown digits stay at weight 400; lighter weights read as a different typeface at 22 vmin.

# hazards
- `public/audio/bell.wav`: owner's first-party WAV authored as a seamless loop — any re-encode or resample pads the seam and breaks the chain.
- `src/audio/controller.ts`: switching beds with a gain ramp leaks the outgoing bed's tail once master rises; the switch must hard-zero the old bus.
- `src/audio/scene.ts`: Tone's `restart()` silently no-ops on a stopped one-shot — the bell retriggers via `player.start()`.
- `src/shaders/expanding-ring.frag`: ring count is hardcoded, not parameterized — concurrent rings is a shader change, not a config change.
- `.project/*.md`: PROJECT.md, PLAN.md, DECISIONS.md and SPEC.md still describe a click-to-reveal settings overlay and an audio-free v1 that no longer exist — verify against code before trusting.
