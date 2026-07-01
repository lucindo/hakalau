import * as Tone from "tone";

const BASE = import.meta.env.BASE_URL;
const NATURE_GAIN = 0.22; // bed level, kept below the melody so it doesn't swamp it

interface StreamDef {
  url: string;
  position?: [number, number, number]; // omit → wide stereo floor (no spatialization)
  drift?: number; // peak ± X sweep (meters) for a slow side-to-side drift
}

// Listener sits at the origin facing -Z. Ocean is the wide floor; birds, wind and
// leaves are placed so attention can move between them. rolloffFactor 0 keeps levels
// steady — position gives direction (HRTF), not distance attenuation.
const STREAMS: readonly StreamDef[] = [
  { url: `${BASE}audio/ocean.mp3` },
  { url: `${BASE}audio/birds.mp3`, position: [4, 2, -2], drift: 4 },
  { url: `${BASE}audio/wind.mp3`, position: [-5, 0, 1] },
  { url: `${BASE}audio/leaves.mp3`, position: [3, -1, 2], drift: 3 },
];

export interface Scene {
  start: () => void;
  restart: () => void;
}

// loop: true is gapless at the sample level; the assets are pre-crossfaded at their
// loop point (offline, see public/audio/CREDITS.md) so the wrap is seamless too.
export function createGardenScene(destination: Tone.InputNode): Scene {
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

// WAV on purpose: the file is authored to chain seamlessly and ships unmodified —
// a lossy re-encode would pad the edges and break the join. It plays as authored:
// straight to the destination, no gain trim, no spatialization. No loop: the
// controller retriggers it once per ring cycle, so at cycle ≈ file length the
// strikes chain like the original loop.
export function createBellScene(destination: Tone.InputNode): Scene {
  const player = new Tone.Player({ url: `${BASE}audio/bell.wav` }).connect(destination);
  // Both map to start(): Tone restarts a playing source and revives a stopped
  // one, while restart() silently no-ops once a one-shot player ends.
  return {
    start: () => player.start(),
    restart: () => player.start(),
  };
}
