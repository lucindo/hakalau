import { hexToRgb } from "../config";
import fragSrc from "../shaders/expanding-ring.frag?raw";
import type { Pattern } from "./pattern";

export const expandingRing: Pattern = {
  id: "expanding-ring",
  fragSrc,
  createBinding(gl, program) {
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uRingPhase = gl.getUniformLocation(program, "u_ringPhase");
    const uDotSize = gl.getUniformLocation(program, "u_dotSize");
    const uDotEnabled = gl.getUniformLocation(program, "u_dotEnabled");
    const uRingSoftness = gl.getUniformLocation(program, "u_ringSoftness");
    const uRingEnabled = gl.getUniformLocation(program, "u_ringEnabled");
    const uBrightness = gl.getUniformLocation(program, "u_brightness");
    const uBgColor = gl.getUniformLocation(program, "u_bgColor");
    const uFgColor = gl.getUniformLocation(program, "u_fgColor");

    return ({ resolution, dpr, ringPhase, config, session }) => {
      gl.uniform2f(uResolution, resolution[0], resolution[1]);
      gl.uniform1f(uRingPhase, ringPhase);
      gl.uniform1f(uDotSize, config.dotSize * dpr); // config px → device px
      gl.uniform1f(uDotEnabled, config.dotEnabled ? 1 : 0);
      gl.uniform1f(uRingSoftness, config.ringSoftness);
      gl.uniform1f(uRingEnabled, session.ringActive ? 1 : 0);
      gl.uniform1f(uBrightness, session.brightness);
      gl.uniform3fv(uBgColor, hexToRgb(config.bgColor));
      gl.uniform3fv(uFgColor, hexToRgb(config.fgColor));
    };
  },
};
