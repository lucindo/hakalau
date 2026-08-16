# Project map

## Overview

Hakalau is a full-screen meditation web app for peripheral-vision practice: a fixed central dot
with a ring that expands from center to edge on a steady rhythm, plus an optional spatial
soundscape (ocean/birds/wind bed, generative pad, or a bell). Ships as a static web app on GitHub
Pages and as native desktop wrappers (macOS/Windows/Linux) via Pake/Tauri. For meditators
practicing the Hakalau technique; no accounts, no backend.

## Stack

- **Language**: TypeScript (strict), ES2022 target, `noEmit` (tsc for type-checking only).
- **Runtime/build**: Vite 8, Bun as package manager/runner.
- **Rendering**: raw WebGL2 (fullscreen fragment shader), no framework — GLSL in `src/shaders/`.
- **Audio**: Tone.js, HRTF-spatialized samples.
- **Validation**: valibot, at the localStorage config boundary.
- **Fonts**: `@fontsource-variable/inter`.
- **Test**: Vitest (`bun run test` — not bare `bun test`, which uses Bun's native runner and lacks `vi.*`).
- **Build**: `bun run build` (`tsc && vite build`). Dev: `bun run dev`. Preview: `bun run preview`.
- **CI/CD**: GitHub Actions — `.github/workflows/deploy.yml` (Pages deploy), `.github/workflows/desktop.yml` (Pake desktop installers on `desktop-v*` tags).

## Repo map

| Path | Contents |
|---|---|
| `src/main.ts` | Entry point — mounts canvas, loads config, starts app. |
| `src/app.ts` | Top-level state machine wiring config panel, preview, renderer, fallback, audio. |
| `src/renderer.ts` | Drives the full practice session (timing, rounds, fade-out) on the WebGL2 canvas. |
| `src/preview.ts` | Always-looping miniature pattern preview for the config screen (own GL context). |
| `src/glHost.ts` | Shared WebGL2 host: pattern binding, DPR clamping, ring-phase advance. |
| `src/gl.ts` | Low-level shader/program compile-and-link helpers (throw on failure). |
| `src/patterns/` | Pluggable visual patterns — `pattern.ts` (interface), `index.ts` (registry), `expanding-ring.ts` (the one pattern). |
| `src/shaders/` | GLSL sources: `fullscreen.vert`, `expanding-ring.frag`. |
| `src/session.ts` | `SessionState` type and fade-out timing constants, shared by renderer/preview. |
| `src/config.ts` | `Config` type, valibot schema, localStorage load/save with per-field fallbacks. |
| `src/presets.ts` | Curated background/foreground color presets. |
| `src/overlay.ts` | Config panel UI (sliders, soundscape/preset pickers, Start button). |
| `src/fallback.ts` | Static centered dot shown when WebGL2 is unavailable. |
| `src/audio/` | `controller.ts` (mixer/session audio lifecycle), `scene.ts` (Tone spatial nature/bell scenes), `melody.ts` (generative pentatonic pad). |
| `src/*.test.ts` | Vitest unit tests (`config.test.ts`, `session.test.ts`). |
| `public/audio/` | Shipped audio assets — `bell.wav` (seamless loop), `birds.mp3`, `leaves.mp3`, `ocean.mp3`, `wind.mp3`, `CREDITS.md`. |
| `public/` | Static assets served as-is — icons, favicon. |
| `assets/icons/` | Source SVG icon (`icon.svg`) used to derive the shipped icon set. |
| `.github/workflows/` | `deploy.yml` (Pages), `desktop.yml` (Pake desktop builds/installers). |
| `.project/` | Session state (`state.md`), mode config (`config.md`), this map. |
