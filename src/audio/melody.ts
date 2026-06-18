import * as Tone from "tone";

// Pentatonic across two octaves → every note is consonant with every other, so
// random selection never needs a "melody" to sound intentional. No tonic pull,
// no resolution, no hook — a harmonic floor, not a tune to track.
const SCALE = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4", "A4"];
const NOTE_CHANCE = 0.55; // per slot; sparse enough that notes drift rather than line up

export interface Melody {
  start: () => void;
  restart: () => void;
}

// A slow generative pad: sparse notes with long attack/release wash into each
// other through a long reverb. Runs on the transport (its own slow clock).
export function createMelody(destination: Tone.InputNode): Melody {
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).connect(destination);
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: { attack: 3, decay: 2, sustain: 0.4, release: 6 },
    volume: -12,
  }).connect(reverb);

  const loop = new Tone.Loop((time) => {
    const note = SCALE[Math.floor(Math.random() * SCALE.length)];
    if (!note || Math.random() > NOTE_CHANCE) return;
    synth.triggerAttackRelease(note, "2n", time, 0.25 + Math.random() * 0.2);
  }, "2n");

  const transport = Tone.getTransport();
  transport.bpm.value = 50;

  return {
    start: () => {
      loop.start(0);
      transport.start();
    },
    restart: () => transport.stop().start(),
  };
}
