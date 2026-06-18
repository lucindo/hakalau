import "./style.css";
import { startApp } from "./app";
import { loadConfig } from "./config";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
startApp(canvas, loadConfig());
