import type { Config } from "../config";
import type { SessionState } from "../session";

// Per-frame state the host hands to a pattern's uniform binding.
export interface FrameContext {
  resolution: readonly [number, number]; // device px
  dpr: number;
  ringPhase: number; // 0..1 within the current ring cycle
  config: Config;
  session: SessionState;
}

// A visual pattern: a fragment shader plus the wiring from frame state to its
// uniforms. The host (renderer) owns the GL context, render loop, and session;
// patterns plug in behind this interface.
export interface Pattern {
  readonly id: string;
  readonly fragSrc: string;
  // Cache uniform locations against the linked program; return the per-frame setter.
  createBinding(gl: WebGL2RenderingContext, program: WebGLProgram): (ctx: FrameContext) => void;
}
