import "./style.css";
import { loadConfig } from "./config";
import { startRenderer } from "./renderer";
import { showStaticDot } from "./fallback";

const config = loadConfig();
const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

if (!startRenderer(canvas, config)) {
  canvas.remove();
  showStaticDot();
}
