let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function makeNoise(ac: AudioContext, duration: number): AudioBuffer {
  const len = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/** Soft thud — ball hits wall or obstacle */
export function playBounce(intensity: number) {
  const ac = getCtx();
  const vol = Math.min(intensity / 10, 1) * 0.25;
  if (vol < 0.03) return;
  const now = ac.currentTime;

  // Filtered noise pop — sounds like a muffled impact
  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.08);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 200 + intensity * 30;
  bp.Q.value = 1.5;
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
  noise.connect(bp).connect(g).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.08);
}

/** Glass-like shatter — obstacle breaks */
export function playShatter() {
  const ac = getCtx();
  const now = ac.currentTime;

  // High crackle — filtered noise
  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.35);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 2000;
  const lp = ac.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(8000, now);
  lp.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.3, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  noise.connect(hp).connect(lp).connect(ng).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.35);

  // Sub thump
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, now);
  osc.frequency.exponentialRampToValueAtTime(25, now + 0.15);
  const og = ac.createGain();
  og.gain.setValueAtTime(0.3, now);
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(og).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** Descending tone — ball falls off edge */
export function playFall() {
  const ac = getCtx();
  const now = ac.currentTime;

  // Filtered noise whoosh
  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.6);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(1200, now);
  bp.frequency.exponentialRampToValueAtTime(100, now + 0.5);
  bp.Q.value = 2;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  noise.connect(bp).connect(g).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.6);
}

/** Rising chime — level complete */
export function playLevelComplete() {
  const ac = getCtx();
  const now = ac.currentTime;
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

  notes.forEach((freq, i) => {
    const t = now + i * 0.15;
    // Two detuned oscillators for a shimmer effect
    for (const detune of [-6, 6]) {
      const osc = ac.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.value = detune;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g).connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    }
  });
}

/** Short ascending chime — power-up collected */
export function playPowerUp() {
  const ac = getCtx();
  const now = ac.currentTime;
  const notes = [880, 1109, 1319]; // A5 C#6 E6

  notes.forEach((freq, i) => {
    const t = now + i * 0.08;
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(g).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Short sizzle — ball on lava */
export function playLavaHiss() {
  const ac = getCtx();
  const now = ac.currentTime;

  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.5);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3000;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.15, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  noise.connect(hp).connect(g).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.5);
}

/** Low rumble — floor crumbles */
export function playCrumble() {
  const ac = getCtx();
  const now = ac.currentTime;

  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.8);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.setValueAtTime(400, now);
  bp.frequency.exponentialRampToValueAtTime(80, now + 0.7);
  bp.Q.value = 1;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.2, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  noise.connect(bp).connect(g).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.8);
}

/** Sci-fi whoosh — teleport pad */
export function playTeleport() {
  const ac = getCtx();
  const now = ac.currentTime;

  // Rising sweep
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.2, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.3);

  // Noise burst
  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.2);
  const bp = ac.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 3000;
  bp.Q.value = 3;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.1, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  noise.connect(bp).connect(ng).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.2);
}

/** Fire crackling — called periodically when fire buildup > 0.3 */
export function playFireCrackle(intensity: number) {
  const ac = getCtx();
  const now = ac.currentTime;
  const vol = intensity * 0.2;

  // Short noise bursts at varying frequencies for crackling
  for (let i = 0; i < 3; i++) {
    const t = now + i * 0.04;
    const noise = ac.createBufferSource();
    noise.buffer = makeNoise(ac, 0.06);
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1000 + Math.random() * 3000;
    bp.Q.value = 3;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol * (0.5 + Math.random() * 0.5), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    noise.connect(bp).connect(g).connect(ac.destination);
    noise.start(t);
    noise.stop(t + 0.06);
  }
}

/** Ice creaking — called periodically when ice buildup > 0.3 */
export function playIceCreak(intensity: number) {
  const ac = getCtx();
  const now = ac.currentTime;
  const vol = intensity * 0.15;

  const osc = ac.createOscillator();
  osc.type = "sine";
  const freq = 800 + Math.random() * 400;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.15);
  const g = ac.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** Sharp crystallize sound — ice hits 1.0 */
export function playFreeze() {
  const ac = getCtx();
  const now = ac.currentTime;

  // High pitched shimmer
  for (const freq of [2000, 3000, 4000]) {
    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(g).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Noise burst
  const noise = ac.createBufferSource();
  noise.buffer = makeNoise(ac, 0.3);
  const hp = ac.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 4000;
  const ng = ac.createGain();
  ng.gain.setValueAtTime(0.2, now);
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  noise.connect(hp).connect(ng).connect(ac.destination);
  noise.start(now);
  noise.stop(now + 0.3);
}

/** Soft filtered noise — continuous while ball moves */
let rollNoise: AudioBufferSourceNode | null = null;
let rollGain: GainNode | null = null;
let rollFilter: BiquadFilterNode | null = null;

export function updateRoll(speed: number) {
  const ac = getCtx();

  if (!rollNoise) {
    rollNoise = ac.createBufferSource();
    rollNoise.buffer = makeNoise(ac, 2);
    rollNoise.loop = true;
    rollFilter = ac.createBiquadFilter();
    rollFilter.type = "lowpass";
    rollFilter.frequency.value = 100;
    rollFilter.Q.value = 0.5;
    rollGain = ac.createGain();
    rollGain.gain.value = 0;
    rollNoise.connect(rollFilter).connect(rollGain).connect(ac.destination);
    rollNoise.start();
  }

  const t = ac.currentTime + 0.05;
  const vol = Math.min(speed / 10, 1) * 0.04;
  const freq = 80 + speed * 20;
  rollGain!.gain.linearRampToValueAtTime(vol, t);
  rollFilter!.frequency.linearRampToValueAtTime(freq, t);
}
