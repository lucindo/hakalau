import * as Tone from "tone";

const BASE = import.meta.env.BASE_URL;
const NATURE_GAIN = 0.22; // bed level, kept below the melody so it doesn't swamp it

interface StreamDef {
  url: string;
  position?: [number, number, number]; // omit → wide stereo floor (no spatialization)
  drift?: number; // peak ± X sweep (meters) for a slow side-to-side drift
}

// Listener sits at the origin facing -Z. Ocean is the wide floor; birds and wind
// are placed so attention can move between them. rolloffFactor 0 keeps levels
// steady — position gives direction (HRTF), not distance attenuation.
const STREAMS: readonly StreamDef[] = [
  { url: `${BASE}audio/ocean.mp3` },
  { url: `${BASE}audio/birds.mp3`, position: [4, 2, -2], drift: 4 },
  { url: `${BASE}audio/wind.mp3`, position: [-5, 0, 1] },
];

export interface Scene {
  start: () => void;
  restart: () => void;
}

export function createScene(destination: Tone.InputNode): Scene {
  const bus = new Tone.Gain(NATURE_GAIN).connect(destination);
  const players = STREAMS.map((s) => {
    const player = new Tone.Player({ url: s.url, loop: true });
    if (!s.position) {
      player.connect(bus);
      return player;
    }
    const [x, y, z] = s.position;
    const panner = new Tone.Panner3D({ panningModel: "HRTF", rolloffFactor: 0 });
    panner.setPosition(x, y, z);
    player.chain(panner, bus);
    if (s.drift) {
      const lfo = new Tone.LFO({ frequency: 0.03, min: x - s.drift, max: x + s.drift });
      lfo.connect(panner.positionX);
      lfo.start();
    }
    return player;
  });

  return {
    start: () => players.forEach((p) => p.start()),
    restart: () => players.forEach((p) => p.restart()),
  };
}
