import "./style.css";
import { loadConfig } from "./config";
import { startRenderer } from "./renderer";
import { getPattern } from "./patterns";
import { createOverlay } from "./overlay";
import { showStaticDot } from "./fallback";
import type { AudioController } from "./audio/controller";

const config = loadConfig();
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

// Tone + the controller load only when audio is actually used, keeping it out
// of the base bundle. Warmed on enable so Start can resume the context promptly.
let audio: AudioController | null = null;
let loading: Promise<AudioController> | null = null;
function ensureAudio(): Promise<AudioController> {
  if (!loading) {
    loading = import("./audio/controller").then((m) => {
      audio = m.createAudioController();
      return audio;
    });
  }
  return loading;
}

const handle = startRenderer(canvas, config, getPattern("expanding-ring"), () => audio?.finish());
if (handle) {
  if (config.audioEnabled) void ensureAudio();
  createOverlay(config, {
    onStart: () => {
      handle.restart();
      if (config.audioEnabled) void ensureAudio().then((a) => a.start(config));
    },
    onAudioChange: () => {
      if (config.audioEnabled) void ensureAudio();
      audio?.setMuted(!config.audioEnabled);
      audio?.setVolume(config.volume);
    },
  });
} else {
  canvas.remove();
  showStaticDot();
}
