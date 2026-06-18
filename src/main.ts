import "./style.css";
import { loadConfig } from "./config";
import { startRenderer } from "./renderer";
import { getPattern } from "./patterns";
import { createOverlay } from "./overlay";
import { showStaticDot } from "./fallback";

const config = loadConfig();
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

if (startRenderer(canvas, config, getPattern("expanding-ring"))) {
  createOverlay(config);
} else {
  canvas.remove();
  showStaticDot();
}
