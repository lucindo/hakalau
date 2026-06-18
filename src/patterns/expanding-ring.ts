import fragSrc from "../shaders/expanding-ring.frag?raw";
import type { Pattern } from "./pattern";

export const expandingRing: Pattern = {
  id: "expanding-ring",
  fragSrc,
  createBinding(gl, program) {
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uPeriod = gl.getUniformLocation(program, "u_period");
    const uDotSize = gl.getUniformLocation(program, "u_dotSize");
    const uDotEnabled = gl.getUniformLocation(program, "u_dotEnabled");
    const uRingSoftness = gl.getUniformLocation(program, "u_ringSoftness");
    const uRingEnabled = gl.getUniformLocation(program, "u_ringEnabled");
    const uBrightness = gl.getUniformLocation(program, "u_brightness");

    return ({ resolution, dpr, time, config, session }) => {
      gl.uniform2f(uResolution, resolution[0], resolution[1]);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uPeriod, config.cycleSeconds);
      gl.uniform1f(uDotSize, config.dotSize * dpr); // config px → device px
      gl.uniform1f(uDotEnabled, config.dotEnabled ? 1 : 0);
      gl.uniform1f(uRingSoftness, config.ringSoftness);
      gl.uniform1f(uRingEnabled, session.ringActive ? 1 : 0);
      gl.uniform1f(uBrightness, session.brightness);
    };
  },
};
