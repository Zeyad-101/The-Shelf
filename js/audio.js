/**
 * audio.js — Duck Quack Sound & Wobble Animation
 *
 * Uses the Web Audio API live graph (oscillator → bandpass filter → gain)
 * to synthesise an authentic "QUACK" vowel sound: a sawtooth wave voiced
 * through a resonant nasal cavity that sweeps its formant frequency,
 * exactly like a real duck bill opening and closing.
 *
 * Each quack creates a brand-new oscillator+filter+gain chain and tears it
 * down after the envelope finishes, so rapid repeated clicks always retrigger
 * the sound instead of being silently ignored while a previous play is still
 * finishing.
 *
 * playDuckQuack() is intentionally synchronous — the AudioContext is created
 * and resumed on the same click event (a user gesture), and the oscillator
 * notes are scheduled at ctx.currentTime so they play immediately. No extra
 * unlock step is needed because the call originates from a direct user click.
 */

let audioCtx = null;
let resumeAttempted = false;

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContextClass();
    } catch (err) {
      console.warn('[audio] AudioContext could not be created:', err);
      return null;
    }
  }
  return audioCtx;
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}
if (typeof window !== 'undefined') {
  ['pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { capture: true, once: true });
  });
}

/**
 * Synchronously ensure the AudioContext is running.
 */
function ensureRunningSync() {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    ctx.resume().catch((err) => {
      console.warn('[audio] ctx.resume() failed:', err);
    });
  }
  return ctx;
}

/**
 * Plays one duck "QUACK" syllable using a live audio node graph:
 *
 *  Oscillator (sawtooth, pitch slides 580 → 320 Hz)
 *    └→ BiquadFilter (bandpass, resonant formant sweeps 1400 → 700 Hz)
 *         └→ GainNode (snappy attack/decay envelope)
 *              └→ destination
 *
 * The formant sweep is what makes it sound like "quack" rather than a buzz.
 *
 * @param {AudioContext} ctx
 * @param {number} delay        - seconds from now to start (0 = immediate)
 * @param {number} pitchMult    - pitch multiplier for variety
 */
function playQuackSyllable(ctx, delay, pitchMult = 1) {
  const t = ctx.currentTime + delay;

  // ── Oscillator (voiced source — like vocal cords) ──
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  // Pitch glides sharply downward: "wah" onset then settling
  osc.frequency.setValueAtTime(580 * pitchMult, t);
  osc.frequency.exponentialRampToValueAtTime(380 * pitchMult, t + 0.04);
  osc.frequency.exponentialRampToValueAtTime(300 * pitchMult, t + 0.18);

  // ── Resonant bandpass (the "bill / nasal cavity" resonance) ──
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 7;                        // high Q = nasal, honky resonance
  // Formant sweeps down: gives the "qu-aack" vowel shape
  filter.frequency.setValueAtTime(1400 * pitchMult, t);
  filter.frequency.exponentialRampToValueAtTime(900 * pitchMult, t + 0.06);
  filter.frequency.exponentialRampToValueAtTime(680 * pitchMult, t + 0.18);

  // ── Second harmonic formant (adds beak brightness) ──
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'bandpass';
  filter2.Q.value = 4;
  filter2.frequency.setValueAtTime(2600 * pitchMult, t);
  filter2.frequency.exponentialRampToValueAtTime(1800 * pitchMult, t + 0.18);

  // ── Gain envelope: snappy attack, natural quack decay ──
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.9, t + 0.012);   // sharp attack
  gain.gain.setValueAtTime(0.9, t + 0.05);              // sustain core
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22); // natural tail-off

  // Wire up: osc → filter1 → gain, osc → filter2 → gain
  osc.connect(filter);
  filter.connect(gain);

  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(580 * pitchMult, t);
  osc2.frequency.exponentialRampToValueAtTime(300 * pitchMult, t + 0.18);
  osc2.connect(filter2);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(0.35, t + 0.015);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
  filter2.connect(gain2);

  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc.start(t);
  osc.stop(t + 0.25);
  osc2.start(t);
  osc2.stop(t + 0.25);
}

/**
 * Plays the full duck sound: a punchy "QUACK" followed by a softer echo quack.
 * Each call varies pitch slightly so it never sounds mechanical.
 *
 * Synchronous on purpose: the click handler is a direct user gesture, so we
 * create/resume the AudioContext inline and schedule fresh oscillators at
 * the current time. Rapid repeated clicks each spawn a brand-new oscillator
 * chain, so the quack always retriggers instead of being silently dropped
 * while a previous play is still finishing.
 */
export function playDuckQuack() {
  try {
    const ctx = ensureRunningSync();
    if (!ctx) return;

    // Use at least 0.005 so audio nodes are never scheduled in the past during resume
    const t0 = Math.max(ctx.currentTime, 0.005);
    const pitch = 0.92 + Math.random() * 0.16;

    // First quack — full volume
    playQuackSyllable(ctx, t0 - ctx.currentTime, pitch);

    // Second quack — slightly higher pitched, softer (classic duck double-quack)
    playQuackSyllable(ctx, (t0 - ctx.currentTime) + 0.22, pitch * 1.06);

  } catch (err) {
    console.warn('[audio] Duck quack failed:', err);
  }
}

/**
 * Triggers a cute physical squash & bounce animation on a duck element.
 * Uses requestAnimationFrame to avoid synchronous layout thrashing.
 */
export function triggerDuckWobble(el) {
  if (!el) return;
  el.classList.remove('duck-quacking');
  requestAnimationFrame(() => {
    el.classList.add('duck-quacking');
  });
  setTimeout(() => {
    el.classList.remove('duck-quacking');
  }, 450);
}

export function isDuckItem(item) {
  if (!item) return false;
  const name = String(item.name || '').toLowerCase();
  return name.includes('duck');
}
