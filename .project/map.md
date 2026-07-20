# Map — Hakalau Meditation Canvas

## Overview
A full-screen web page for Hakalau peripheral-vision meditation: a steady central fixation dot
anchors the gaze while a ring expands from center past the screen edges on a constant period.
The user configures timing, dot, ring softness, colors and soundscape on a home screen, then
runs a session (3·2·1 countdown → ring + optional audio → fade). Single static client-side page
deployed to GitHub Pages, built as a pluggable pattern host over a shared WebGL2 render loop.

## Stack
- **Language:** TypeScript 5 (browser, ES2022), `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, `noUnusedLocals`/`noUnusedParameters` (`tsconfig.json`).
- **Rendering:** raw WebGL2, one fullscreen fragment shader per pattern. No Three.js.
- **Runtime deps:** `valibot` (config validation), `tone` (audio graph),
  `@fontsource-variable/inter` (UI font).
- **Build/tooling:** Vite 6 with `base: '/hakalau/'` (`vite.config.ts`), Bun as runtime and
  package manager. Tests: Vitest.
- **Commands:** `bun run dev` · `bun run build` (`tsc && vite build`) · `bun run test --run` ·
  `bun run preview`.
- **Deploy:** GitHub Actions → GitHub Pages on push to `main` (`.github/workflows/deploy.yml`:
  install → test → build → upload `dist/`).

## Repo map

### Top level
| Path | Holds |
|------|-------|
| `src/` | All application code (see below). |
| `public/` | Static assets copied verbatim: `audio/` (4 nature `.mp3`, `bell.wav`) + `CREDITS.md`. |
| `.github/workflows/` | `deploy.yml` — test/build/publish pipeline. |
| `.project/` | Durable project state: this map, `state.md`, `PROJECT.md`, `SPEC.md`, `DECISIONS.md`, `PLAN.md`, `EXPLORE.md`, `config.md`. |
| `index.html` | Vite entry; loads `src/main.ts` as a module. |
| `dist/`, `node_modules/`, `.vite/` | Build output, deps, Vite dep cache — all gitignored except `.vite/`. |

### `src/`
| Path | Holds |
|------|-------|
| `main.ts` | Entry (9 lines): imports font + CSS, creates the `.stage` canvas, calls `startApp(canvas, loadConfig())`. |
| `app.ts` | Screen state machine `config → countdown → running → paused → ending`; owns the audio lazy-import, the 3·2·1 countdown, the pause prompt, and click-to-pause. |
| `renderer.ts` | Session host: `restart`/`pause`/`resume`/`stop` + `onFinish`/`onFadeComplete`/`onCycle`; window-resize sizing, `requestAnimationFrame` loop, idle-frame constant. |
| `glHost.ts` | Shared GL plumbing: `createPatternHost` (context + program + draw), `advanceRingPhase`, `deviceDpr` (clamped to 2). |
| `preview.ts` | Second WebGL2 context driving the boxed live preview on the config screen; always looping, no session or fade. |
| `session.ts` | Pure logic: `sessionState`, `fadeBrightness`, `createFinishLatch`, `FADE_SECONDS`. |
| `config.ts` | `Config` type, `CONFIG_BOUNDS`, `SOUNDSCAPES`, Valibot schema, localStorage `loadConfig`/`saveConfig` with legacy `audioEnabled` migration, `hexToRgb`. |
| `presets.ts` | `COLOR_PRESETS` — six curated background/foreground pairs. |
| `overlay.ts` | Builds the config panel: Start button plus nine controls (cycle, rounds, dot on/off + size, softness, preset, bg, fg, soundscape, volume) and the `addRange`/`addNumber`/`addCheckbox`/`addColor`/`addSelect` helpers. |
| `gl.ts` | `createProgram` / `compileShader` — throw on GLSL compile or link failure. |
| `fallback.ts` | `showStaticDot` — the no-WebGL2 path. |
| `style.css` | Design tokens (`:root`) plus `.card`, `.screen`, `.stage`, `.config`, `.preview`, `.overlay*`, `.countdown`, `.pause*`, `.fallback-dot`, and a reduced-motion block. |
| `patterns/` | `pattern.ts` (`Pattern`, `FrameContext`), `expanding-ring.ts` (uniform binding), `index.ts` (registry, `getPattern`). |
| `shaders/` | `fullscreen.vert` (buffer-less triangle), `expanding-ring.frag` (dot + ring, bg/fg, brightness). |
| `audio/` | `controller.ts` (master gain, per-bed buses, `arm`/`start`/`cycle`/`finish`/`setVolume`/`setMuted`), `scene.ts` (`createGardenScene` HRTF streams, `createBellScene`), `melody.ts` (generative pentatonic pad). |
| `*.test.ts` | `config.test.ts` (persistence, validation fallbacks, soundscape migration, `hexToRgb`), `session.test.ts` (rounds, fade, latch). |
