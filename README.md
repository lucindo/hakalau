# Hakalau

A full-screen meditation canvas for **Hakalau** peripheral-vision practice (after the teachings of
Forrest Knutson). A steady central dot anchors the gaze while a ring expands from the center past
the screen edges on a constant rhythm, drawing awareness out into the periphery — with an optional
spatial soundscape for the same "take it all in" quality in the ears.

**Live:** https://lucindo.github.io/hakalau/

## Use

Open the page, adjust to taste, press **Start session**. The panel hides during practice; click/tap
or press a key to bring it back, `Esc` to dismiss. Mouse movement alone won't reveal it — the dark
field is the point.

Controls:

- **Cycle (s)** — seconds per ring expansion (the practice rhythm; pair it with your breath).
- **Rounds** — number of cycles, then a gentle fade out. `0` runs endlessly.
- **Fixation dot** — on/off and size.
- **Ring softness** — crisp to diffuse.
- **Background / Dot-ring colors** — with curated presets.
- **Sound** + **Volume** — off by default. A wide ocean bed, spatially-placed birds and wind, and a
  slow generative pad underneath. Use headphones — the spatialization is HRTF.

## Desktop apps

Native builds wrap the same app in a lightweight [Pake](https://github.com/tw93/pake) (Tauri) window
— **macOS** (universal, Intel + Apple Silicon), **Windows** (x64), and **Linux** (x64 `.deb` /
`.rpm` / `.AppImage`). The window opens maximized, since the practice wants the whole screen. They
load the live site, so the app stays up to date automatically; there's nothing to update by hand.
The wrapper is versioned independently of the web app (`desktop-v*` tags) — a new installer is
published only when the shell itself changes.

**[Download the latest release →](https://github.com/lucindo/hakalau/releases/latest)**

Settings live in each app's own storage, so the desktop app starts at the defaults rather than
inheriting what you set in the browser, and the two stay independent afterwards.

The builds are **unsigned**, so the first launch needs one extra step:

- **macOS** — if you see "Hakalau is damaged", clear the quarantine flag, then open normally:
  ```sh
  xattr -dr com.apple.quarantine "/Applications/Hakalau.app"
  ```
  (or right-click the app → **Open**).
- **Windows** — at the SmartScreen prompt, click **More info → Run anyway**.
- **Linux** — pick the format for your distro: `.deb` (Debian/Ubuntu, `sudo apt install ./…deb`),
  `.rpm` (Fedora/openSUSE, `sudo dnf install ./…rpm`), or `.AppImage` (any distro — `chmod +x` and
  run).

## Develop

```sh
bun install
bun run dev      # vite dev server
bun run test     # vitest
bun run build    # tsc + vite build (outputs dist/)
```

## How it works

Raw WebGL2 — a single fullscreen fragment shader draws the dot and ring; no Three.js, no Canvas 2D.
The renderer is a pattern-agnostic host (loop, sizing, session timing) so new visual patterns plug
in under `src/patterns/`. Config is validated at the boundary (Valibot) and persisted to
localStorage. Audio is a self-contained Tone.js layer, dynamically imported only when enabled, so it
adds nothing to the base bundle for users who keep it off. No backend; degrades to a static dot when
WebGL2 is absent.

Stack: TypeScript · WebGL2 · Tone.js · Vite · Bun · Valibot · Vitest. Deployed to GitHub Pages via
Actions on push to `main`.

Audio samples are CC0 / public-domain field recordings — see
[`public/audio/CREDITS.md`](public/audio/CREDITS.md).
