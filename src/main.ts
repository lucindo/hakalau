import "./style.css";
import { loadConfig } from "./config";
import { startRenderer } from "./renderer";
import { getPattern } from "./patterns";
import { createOverlay } from "./overlay";
import { showStaticDot } from "./fallback";

const config = loadConfig();
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

const handle = startRenderer(canvas, config, getPattern("expanding-ring"));
if (handle) {
  createOverlay(config, handle.restart);
} else {
  canvas.remove();
  showStaticDot();
}
