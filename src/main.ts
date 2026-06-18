import "./style.css";
import { startRenderer } from "./renderer";
import { showStaticDot } from "./fallback";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);

if (!startRenderer(canvas)) {
  canvas.remove();
  showStaticDot();
}
