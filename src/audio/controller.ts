import * as Tone from "tone";
import type { Config } from "../config";
import { FADE_SECONDS } from "../session";

// BASE_URL keeps the path correct under the GitHub Pages subpath.
const OCEAN_URL = `${import.meta.env.BASE_URL}audio/ocean.mp3`;
const FADE_IN_SECONDS = 2;
const CONTROL_RAMP = 0.1; // smooth a live volume/mute change without a click

export interface AudioController {
  start: (config: Config) => Promise<void>; // resume context (gesture) + (re)start the bed, fade in
  finish: () => void; // fade out over FADE_SECONDS, mirroring the visual session fade
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}

// Walking skeleton: a single looped ocean bed behind a master gain envelope.
// Tone lives here so the dynamic import keeps it out of the base bundle.
export function createAudioController(): AudioController {
  const master = new Tone.Gain(0).toDestination();
  const ocean = new Tone.Player({ url: OCEAN_URL, loop: true }).connect(master);
  let target = 0; // gain to ramp toward when audible; mute parks the envelope at 0
  let muted = false;
  let started = false;
  const audible = () => (muted ? 0 : target);

  return {
    async start(config) {
      target = config.volume;
      muted = false;
      await Tone.start(); // resume the context on the user gesture
      await Tone.loaded(); // decode the buffer before playing
      if (started) ocean.restart();
      else {
        ocean.start();
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
