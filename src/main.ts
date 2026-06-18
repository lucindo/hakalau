import "./style.css";
import { loadConfig } from "./config";
import { startRenderer } from "./renderer";
import { createOverlay } from "./overlay";
import { showStaticDot } from "./fallback";

const config = loadConfig();
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

if (startRenderer(canvas, config)) {
  createOverlay();
} else {
  canvas.remove();
  showStaticDot();
}
