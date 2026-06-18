import * as Tone from "tone";
import type { Config } from "../config";
import { FADE_SECONDS } from "../session";
import { createScene } from "./scene";

const FADE_IN_SECONDS = 2;
const CONTROL_RAMP = 0.1; // smooth a live volume/mute change without a click

export interface AudioController {
  start: (config: Config) => Promise<void>; // resume context (gesture) + (re)start the bed, fade in
  finish: () => void; // fade out over FADE_SECONDS, mirroring the visual session fade
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}

// Owns the master gain envelope and session lifecycle; the scene owns the graph.
// Tone lives here so the dynamic import keeps it out of the base bundle.
export function createAudioController(): AudioController {
  const master = new Tone.Gain(0).toDestination();
  const scene = createScene(master);
  let target = 0; // gain to ramp toward when audible; mute parks the envelope at 0
  let muted = false;
  let started = false;
  const audible = () => (muted ? 0 : target);

  return {
    async start(config) {
      target = config.volume;
      muted = false;
      await Tone.start(); // resume the context on the user gesture
      await Tone.loaded(); // decode the buffers before playing
      if (started) scene.restart();
      else {
        scene.start();
        started = true;
      }
      master.gain.cancelScheduledValues(Tone.now());
      master.gain.rampTo(audible(), FADE_IN_SECONDS);
    },
    finish() {
      master.gain.rampTo(0, FADE_SECONDS);
    },
    setVolume(volume) {
      target = volume;
      master.gain.rampTo(audible(), CONTROL_RAMP);
    },
    setMuted(value) {
      muted = value;
      master.gain.rampTo(audible(), CONTROL_RAMP);
    },
  };
}
