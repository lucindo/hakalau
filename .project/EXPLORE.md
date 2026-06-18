# Explore — Audio for Hakalau Canvas

Problem: add an ambient audio layer ("3D nature/ocean") that attaches to the session
lifecycle. Deferred in **D9** — only the start/stop/fade hook was kept; no Web Audio code or
abstraction exists yet.

## Fixed by prior decisions / constraints
- **Hook point exists.** `RendererHandle.restart()` = session start/restart (a user gesture via
  the "Start session" button → satisfies the browser autoplay policy: create/resume
  `AudioContext` there). Session end = `session.finished` + `brightness` ramp in `session.ts` —
  mirror it to fade audio out.
- **No runtime network** (PROJECT constraint) → any samples must be *bundled*, not fetched.
- **Lean bundle** (target ≤150 KB gz; app is ~5 KB JS today) → library/asset weight is a real cost.
- **Vanilla TS, no framework** (D8) → a heavy audio framework cuts against the grain.

## Candidate approaches

### A. Procedural synthesis, raw Web Audio (no assets)
One-line: pink/brown-noise buffer → biquad bandpass/lowpass → slow LFO on filter+gain to mimic
ocean swell; all generated in-browser.
- **Trade-offs:** zero assets, tiny code, honors no-network + lean-bundle perfectly; "wave"
  realism caps at *evocative*, not field-recording. Tuning to sound good is the real effort.
- **Pick when:** you want the audio to belong to the app (no licensing, no MB) and accept a
  stylized rather than literal ocean.
- **Effort/risk:** moderate effort (sound design tuning); low tech risk. Composes cleanly with the
  ring rhythm — drive swell from `ringPhase`/`cycleSeconds`.

### B. Sample-based loop, bundled (raw Web Audio or `<audio loop>`)
One-line: ship one or a few seamless ambient loops; play via `AudioBufferSourceNode.loop`.
- **Trade-offs:** best realism, simplest playback code; adds asset weight (a decent seamless ocean
  loop is hundreds of KB even as compressed mp3/ogg) and a licensing/sourcing task. Seamless
  looping needs a clean zero-crossing loop or it ticks.
- **Pick when:** literal, high-fidelity nature sound matters more than bundle size.
- **Effort/risk:** low code effort; the work is sourcing/licensing/trimming the loop. Bundle-budget
  risk if "a few soundscapes" each weigh in.

### C. Tone.js generative
One-line: use Tone.js synths + transport to build an evolving generative pad/drone.
- **Trade-offs:** nicest DX for *evolving* generative music; library is larger than the entire
  current app, and pulls in a framework-shaped dependency against D8's vanilla grain.
- **Pick when:** the goal grows from "ambient bed" to "generative music that develops over a
  session." Overkill for a noise+filter ocean.
- **Effort/risk:** low-moderate effort; bundle/dependency risk is the main cost.

### D. Binaural / entrainment tones, raw Web Audio
One-line: two slightly detuned L/R oscillators at a target beat freq, optionally over a noise bed;
pair the beat to the ring period.
- **Trade-offs:** tiny code; a *different intent* (brainwave entrainment) than "nature/ocean" —
  requires headphones to work, and the efficacy claim is contested. Could layer under A.
- **Pick when:** the meditation goal is entrainment, not ambience. Distinct enough to name; likely
  not what "3D nature/ocean" meant.

### Cross-cutting: spatial 3D (PannerNode/HRTF)
A modifier on A/B, not a separate source. Real 3D presence needs headphones and moving sources;
for a fixed-center meditation field the payoff is thin. Treat "3D" as *probably aspirational* unless
the operator specifically wants positioned, moving sound on headphones.

## Open questions (for /ds-grill-me)
1. **Synthesis (A) vs samples (B)** — accept stylized zero-asset sound, or pay bundle weight for
   literal realism? This is the spine of the decision.
2. **Was "3D" literal?** Spatial/headphone sound, or just "immersive ambience"? Kills or keeps the
   PannerNode question.
3. **Coupled or independent?** Swell synced to the ring cycle (`ringPhase`), or a free-running
   ambient bed unrelated to ring timing?
4. **Lifecycle:** start only on "Start session"? Fade out with `brightness` on session end? Behavior
   on restart (crossfade vs hard reset)?
5. **Controls:** volume/mute in the overlay + persisted in config (like colors)? Default muted or
   on?
6. **One soundscape or selectable?** A presets-style picker (mirrors the color presets) or a single
   bed?

## Lean (operator's call)
For *this* app — lean bundle, no-network, vanilla, a meditation bed rather than a soundtrack — **A
(procedural, raw Web Audio)** fits the constraints best and adds ~no weight. **B** only if literal
realism is non-negotiable. Decide via `/ds-grill-me`.

## Sources
- MDN, Autoplay guide / Best practices — gesture-gated `AudioContext.resume()`.
- Chrome for Developers, "Web Audio, Autoplay Policy and Games" — resume on user gesture.
- Noisehack, "Generate Noise with the Web Audio API" — pink/brown noise for ambience.
- MDN, "Web audio spatialization basics" — PannerNode/HRTF, headphone-oriented 3D.
- Tonejs.github.io + GitHub Performance wiki — Tone.js scope/bundle trade-off.
