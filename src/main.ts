import "@fontsource-variable/inter";
import "./style.css";
import { startApp } from "./app";
import { loadConfig } from "./config";

const canvas = document.createElement("canvas");
canvas.className = "stage";
document.body.appendChild(canvas);
startApp(canvas, loadConfig());
