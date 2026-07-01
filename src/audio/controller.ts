import * as Tone from "tone";
import type { Config, Soundscape } from "../config";
import { FADE_SECONDS } from "../session";
import { createMelody } from "./melody";
import { createBellScene, createGardenScene } from "./scene";

const FADE_IN_SECONDS = 2;
const CONTROL_RAMP = 0.1; // smooth a live volume/mute change without a click

type BedName = Exclude<Soundscape, "off">;

interface Bed {
  bus: Tone.Gain;
  parts: ReadonlyArray<{ start: () => void; restart: () => void }>;
  started: boolean;
  fadeIn: number; // seconds; 0 = enter at full level immediately
}

export interface AudioController {
  warm: () => void; // build every bed so all samples fetch+decode up front
  arm: () => Promise<void>; // resume the context on the user gesture, before start()
  start: (config: Config) => Promise<void>; // (re)start the configured bed and fade in
  cycle: () => void; // a new ring cycle began: the bell restrikes; other beds flow on
  finish: () => void; // fade out over FADE_SECONDS, mirroring the visual session fade
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}

// Owns the master gain envelope and session lifecycle; each bed owns its graph.
// Tone lives here so the dynamic import keeps it out of the base bundle.
export function createAudioController(): AudioController {
  const master = new Tone.Gain(0).toDestination();
  const beds = new Map<BedName, Bed>();
  let current: BedName | null = null;
  let target = 0; // gain to ramp toward when audible; mute parks the envelope at 0
  let muted = false;
  const audible = () => (muted ? 0 : target);

  function bedFor(name: BedName): Bed {
    const existing = beds.get(name);
    if (existing) return existing;
    const bus = new Tone.Gain(0).connect(master);
    // Bell enters clean: a fade-in would swell over the strike attacks.
    const bed: Bed =
      name === "garden"
        ? { bus, parts: [createGardenScene(bus), createMelody(bus)], started: false, fadeIn: FADE_IN_SECONDS }
        : { bus, parts: [createBellScene(bus)], started: false, fadeIn: 0 };
    beds.set(name, bed);
    return bed;
  }

  return {
    // Construction is inert (bus and master gains at 0, nothing started), so
    // warming at page load downloads and decodes without a sound.
    warm() {
      bedFor("garden");
      bedFor("bell");
    },
    async arm() {
      await Tone.start(); // resume the context while the gesture is still live
    },
    async start(config) {
      if (config.soundscape === "off") return; // callers guard; narrows the bed name
      const bed = bedFor(config.soundscape);
      target = config.volume;
      muted = false;
      await Tone.start(); // idempotent; context already resumed by arm()
      await Tone.loaded(); // decode the buffers before playing
      // Master is silent between sessions, so switching beds is a hard route
      // change — bus gains are on/off switches; only the master envelope fades.
      // A ramp here would leak the old bed once the master comes up.
      if (current !== null && current !== config.soundscape) {
        bedFor(current).bus.gain.value = 0;
      }
      current = config.soundscape;
      bed.bus.gain.value = 1;
      if (bed.started) {
        for (const p of bed.parts) p.restart();
      } else {
        for (const p of bed.parts) p.start();
        bed.started = true;
      }
      master.gain.cancelScheduledValues(Tone.now());
      if (bed.fadeIn === 0) {
        master.gain.value = audible();
      } else {
        master.gain.rampTo(audible(), bed.fadeIn);
      }
    },
    cycle() {
      if (current !== "bell") return;
      const bed = beds.get(current);
      if (bed) for (const p of bed.parts) p.restart();
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
