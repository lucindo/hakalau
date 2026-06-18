# Project — Hakalau Meditation Canvas

## Overview
A full-screen dark web page for Hakalau peripheral-vision meditation (teachings of Forrest
Knutson). A steady central fixation dot anchors the gaze while a ring expands from center past
the screen edges on a constant period, drawing attention into the periphery. Single static page,
fully client-side, deployed to GitHub Pages. Built as a pluggable pattern host so future visual
patterns (e.g. hyperspace/warp) can be added without touching the renderer.

## Stack
- TypeScript 5 (browser, ES2022), strict + `noUncheckedIndexedAccess`.
- Rendering: raw WebGL2, single fullscreen fragment shader (no Three.js).
- Build/tooling: Vite 6, Bun. Validation: Valibot. Tests: Vitest.
- Commands: `bun run dev` · `bun run build` (tsc + vite) · `bun run test --run` · `bun run preview`.
- Deploy: GitHub Actions → GitHub Pages, `base: '/hakalau/'` (live at lucindo.github.io/hakalau/).

## Repo map
| Path | Holds |
|------|-------|
| `src/main.ts` | Entry: loads config, starts renderer with the expanding-ring pattern, mounts overlay; falls back to a static dot if no WebGL2. |
| `src/renderer.ts` | Pattern-agnostic host: WebGL2 context, DPR-aware sizing, render loop, session timing, continuous ring-phase accumulator. |
| `src/session.ts` | Pure rounds/fade logic (`sessionState`); 1 round = 1 cycle, 0 = endless, fade-out on completion. |
| `src/config.ts` | Typed `Config`, defaults, Valibot-validated localStorage load/save; `hexToRgb` for GL. |
| `src/presets.ts` | Curated background/foreground color pairs (Black/White default, Kutastha, low-contrast options). |
| `src/overlay.ts` | Settings panel: reveal on click/key (not mouse-move), close button + Esc, auto-hide, live controls (timing, dot, ring, colors, presets) bound to config. |
| `src/gl.ts` | Shader compile/link helpers (throw loudly on GLSL errors). |
| `src/fallback.ts` | Static centered dot for the no-WebGL2 path. |
| `src/patterns/` | `Pattern`/`FrameContext` interface, `expanding-ring` binding, registry (`getPattern`). |
| `src/shaders/` | GLSL: `fullscreen.vert` (buffer-less triangle), `expanding-ring.frag` (dot + ring, bg/fg colors). |
| `.github/workflows/deploy.yml` | CI: test → build → publish `dist/` to Pages on push to `main`. |
| `.project/` | Durable project state: this map, `SPEC.md`, `DECISIONS.md`, `PLAN.md`. |

## Constraints
- Renderer must be WebGL2 fullscreen-shader; Three.js and CSS/Canvas-2D-as-primary are forbidden.
- No backend or runtime network dependency; config lives only in localStorage (no PII).
- Validate the stored config at the boundary; fall back to defaults on corrupt/partial data.
- Degrade to a static centered dot when WebGL2 is absent (no crash).
- Bundle stays lean (target ≤150 KB gz; currently ~4 KB JS).
- New visual patterns plug in via `src/patterns/` — the renderer host stays pattern-agnostic.
