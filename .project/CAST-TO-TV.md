# Research — Casting Hakalau to a TV

Researched 2026-11-06, after a user asked for a "cast" option for big-screen play.

**Conclusion:** no in-app feature for now. OS/browser screen mirroring already works with
zero code; tell users how (text below). Casting is not video-only, but every *in-app* route
is either media-element-only or lacks WebGL.

## Options

| Route | Verdict | Why |
|---|---|---|
| Google Cast custom Web Receiver (app runs on the Chromecast) | ✗ | Receiver has no WebGL → would only show the static-dot fallback. Also needs Google's `cast_sender.js` at runtime (violates no-third-party-runtime) and Cast Developer Console registration. |
| Remote Playback API / Safari AirPlay picker | ✗ | `<video>`/`<audio>` only. `canvas.captureStream()` → `<video>` → AirPlay fails (WebKit bug 281693, open). |
| Presentation API (`new PresentationRequest(url).start()`) | ~ | Chromium only, experimental. Chrome renders the URL in an offscreen tab and streams it via Cast Streaming ("1-UA mode"), so WebGL works. Sources are 2016–17 Chromium material; current behavior not verified. |
| Screen / tab mirroring (Chrome Cast tab, AirPlay mirroring, Win+K, Android Screen Cast) | ✓ | Device renders WebGL locally, streams as video. Slow ring animation streams fine; latency irrelevant. Works for the Pake desktop app too (OS-level). |

## If a one-tap button is ever wanted

Only the Presentation API fits the settled constraints. Prototype these unknowns first:
- Does the offscreen presentation tab see the controller's localStorage config?
- Can audio start there without a user gesture (autoplay policy)?
- How do controller and TV stay in sync (`PresentationConnection` messages)?
- Pake/Tauri webviews (WKWebView, WebView2) almost certainly lack it — web-only.

## User-facing text (menu names unverified on devices)

> **Playing Hakalau on your TV**
>
> Hakalau runs on your phone or computer, and you mirror its screen to the TV. Pick the
> option that matches your devices:
>
> - **Chromecast or Google TV:** open Hakalau in Chrome, open the ⋮ menu → **Cast…**
>   (sometimes under *Cast, save, and share*), pick your TV, and choose **Cast tab** as the
>   source. The sound plays on the TV too.
> - **Apple TV or an AirPlay TV:** on a Mac, iPhone or iPad, open **Control Center → Screen
>   Mirroring** and pick your TV. This also works with the desktop app.
> - **Windows with a Miracast TV:** press **Win + K** and pick your TV.
> - **Android:** open **Quick Settings → Screen Cast** (called *Smart View* on Samsung) and
>   pick your TV.
>
> Tips: put Hakalau in fullscreen once it's on the TV, and keep your device awake, because
> mirroring stops if it goes to sleep.

## Sources
- [Google Cast UX guidelines — receiver has no WebGL, low-power hardware](https://developers.google.com/cast/docs/ux_guidelines)
- [Google Cast audio devices guide](https://developers.google.com/cast/docs/audio)
- [Build a Custom Web Receiver (codelab)](https://developers.google.com/cast/codelabs/cast-receiver)
- [Chromium: Presentation API 1-UA mode intent](https://groups.google.com/a/chromium.org/g/blink-dev/c/HZ_ZHEE9oDo)
- [W3C Second Screen implementation status](https://www.w3.org/wiki/Second_Screen/Implementation_Status)
- [MDN: Presentation API](https://developer.mozilla.org/en-US/docs/Web/API/Presentation_API)
- [MDN: Remote Playback API](https://developer.mozilla.org/en-US/docs/Web/API/Remote_Playback_API)
- [WebKit bug 281693 — AirPlay fails with a stream as srcObject](https://bugs.webkit.org/show_bug.cgi?id=281693)
