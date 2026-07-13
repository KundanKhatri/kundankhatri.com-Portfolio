#!/usr/bin/env node
// Synthesizes the site's SFX set as 44.1kHz/16-bit mono WAVs. Zero deps — pure DSP + a raw WAV writer.
// Re-run any time to regenerate: `node scripts/generate-sfx.mjs`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'public', 'sounds');

// ---------- primitives ----------

function samplesFor(durationSec) {
  return Math.round(durationSec * SR);
}

function whiteNoise(n) {
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = Math.random() * 2 - 1;
  return buf;
}

/** One-pole lowpass. cutoffFn(t) in Hz — constant or time-varying for filter sweeps. */
function lowpass(input, cutoffFn) {
  const out = new Float32Array(input.length);
  const dt = 1 / SR;
  let prev = 0;
  const fn = typeof cutoffFn === 'function' ? cutoffFn : () => cutoffFn;
  for (let i = 0; i < input.length; i++) {
    const rc = 1 / (2 * Math.PI * Math.max(fn(i / SR), 20));
    const alpha = dt / (rc + dt);
    prev += alpha * (input[i] - prev);
    out[i] = prev;
  }
  return out;
}

/** Sine oscillator with a time-varying frequency (phase accumulator avoids clicks on pitch bends). */
function sineSweep(durationSec, freqFn) {
  const n = samplesFor(durationSec);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    phase += (2 * Math.PI * freqFn(i / SR)) / SR;
    out[i] = Math.sin(phase);
  }
  return out;
}

function applyEnvelope(buf, envFn) {
  const n = buf.length;
  for (let i = 0; i < n; i++) buf[i] *= envFn(i / n, i / SR);
  return buf;
}

function scale(buf, g) {
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
  return buf;
}

function mix(...layers) {
  const len = Math.max(...layers.map((l) => l.length));
  const out = new Float32Array(len);
  for (const layer of layers) for (let i = 0; i < layer.length; i++) out[i] += layer[i];
  return out;
}

function normalize(buf, peak = 0.85) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  if (max > 0) scale(buf, peak / max);
  return buf;
}

/** 2ms edge fades kill the sample-0/sample-N discontinuities that cause pops. */
function fadeEdges(buf, fadeSec = 0.002) {
  const n = Math.min(samplesFor(fadeSec), Math.floor(buf.length / 2));
  for (let i = 0; i < n; i++) {
    const g = i / n;
    buf[i] *= g;
    buf[buf.length - 1 - i] *= g;
  }
  return buf;
}

// ---------- sound design ----------

function genClick() {
  // punchy "thock": fast pitch-drop sine + a short filtered-noise transient for attack bite
  const dur = 0.06;
  const tone = sineSweep(dur, (t) => 180 * Math.pow(90 / 180, t / dur));
  applyEnvelope(tone, (_frac, t) => Math.min(1, t / 0.002) * Math.exp(-t * 40));

  const noiseDur = 0.005;
  const noise = lowpass(whiteNoise(samplesFor(noiseDur)), 4000);
  applyEnvelope(noise, (frac) => Math.exp(-frac * 8));
  scale(noise, 0.6);

  const out = normalize(mix(tone, noise), 0.85);
  return fadeEdges(out);
}

function genHover() {
  // barely-there tick: filtered noise burst + a faint high sine, both very quiet
  const dur = 0.016;
  const noise = lowpass(whiteNoise(samplesFor(dur)), 6000);
  applyEnvelope(noise, (frac) => Math.exp(-frac * 7));

  const tone = sineSweep(dur, () => 2600);
  applyEnvelope(tone, (frac) => Math.exp(-frac * 12));
  scale(tone, 0.5);

  const out = normalize(mix(noise, tone), 0.35);
  return fadeEdges(out, 0.0015);
}

function genWhoosh() {
  // filtered noise, cutoff sweeps up then back down (swell-and-release) with a matching amplitude arc
  const dur = 0.3;
  const noise = lowpass(whiteNoise(samplesFor(dur)), (t) => {
    const frac = t / dur;
    return frac < 0.5 ? 200 + 3800 * (frac / 0.5) : 4000 - 3700 * ((frac - 0.5) / 0.5);
  });
  applyEnvelope(noise, (frac) => Math.sin(Math.PI * frac));

  const out = normalize(noise, 0.7);
  return fadeEdges(out);
}

function genBoot() {
  // sci-fi power-on: rising two-tone (root + fifth) under a slow attack, plus a tremolo shimmer layer
  const dur = 0.5;
  const rootFreq = (t) => 220 + (440 - 220) * (t / dur);
  const base = sineSweep(dur, rootFreq);
  const fifth = sineSweep(dur, (t) => rootFreq(t) * 1.5);

  const ampEnv = (_frac, t) => Math.min(1, t / 0.15) * (t > dur - 0.1 ? Math.max(0, (dur - t) / 0.1) : 1);
  applyEnvelope(base, ampEnv);
  applyEnvelope(fifth, ampEnv);
  scale(fifth, 0.5);

  const shimmer = lowpass(whiteNoise(samplesFor(dur)), 8000);
  applyEnvelope(shimmer, (_frac, t) => 0.15 * Math.sin(2 * Math.PI * 6 * t) * Math.min(1, t / 0.1));

  const out = normalize(mix(base, fifth, shimmer), 0.8);
  return fadeEdges(out);
}

function genTap() {
  // playful "bonk": pitch-drop sine with a light wobble + tiny impact transient
  const dur = 0.12;
  const tone = sineSweep(dur, (t) => {
    const base = 300 * Math.pow(150 / 300, t / dur);
    return base + 8 * Math.sin(2 * Math.PI * 18 * t);
  });
  applyEnvelope(tone, (_frac, t) => Math.min(1, t / 0.005) * Math.exp(-t * 18));

  const noise = lowpass(whiteNoise(samplesFor(0.008)), 2500);
  applyEnvelope(noise, (frac) => Math.exp(-frac * 10));
  scale(noise, 0.5);

  const out = normalize(mix(tone, noise), 0.85);
  return fadeEdges(out);
}

function genSuccess() {
  // 3-note major arpeggio (C5-E5-G5), bell-ish tone = fundamental + quiet 2nd harmonic, exponential decay
  const notes = [
    { start: 0, freq: 523.25 },
    { start: 0.1, freq: 659.25 },
    { start: 0.2, freq: 783.99 },
  ];
  const noteDur = 0.25;
  const total = new Float32Array(samplesFor(0.45));

  for (const { start, freq } of notes) {
    const startSample = samplesFor(start);
    const n = samplesFor(noteDur);
    for (let i = 0; i < n && startSample + i < total.length; i++) {
      const t = i / SR;
      const fundamental = Math.sin(2 * Math.PI * freq * t);
      const overtone = 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
      const env = Math.min(1, t / 0.003) * Math.exp(-t * 9);
      total[startSample + i] += (fundamental + overtone) * env * 0.5;
    }
  }

  const out = normalize(total, 0.8);
  return fadeEdges(out);
}

function genTransition() {
  // deeper cinematic whoosh: lowpassed noise sweep + a faint low sine rumble underneath
  const dur = 0.4;
  const noise = lowpass(whiteNoise(samplesFor(dur)), (t) => {
    const frac = t / dur;
    return frac < 0.4 ? 100 + 1100 * (frac / 0.4) : 1200 - 1050 * ((frac - 0.4) / 0.6);
  });
  applyEnvelope(noise, (frac) => Math.pow(Math.sin(Math.PI * frac), 0.7));

  const rumble = sineSweep(dur, (t) => 55 + 15 * Math.sin(2 * Math.PI * 0.5 * t));
  applyEnvelope(rumble, (_frac, t) => 0.25 * Math.sin(Math.PI * (t / dur)));

  const out = normalize(mix(noise, rumble), 0.75);
  return fadeEdges(out);
}

// ---------- WAV encoding ----------

function encodeWav(samples, sampleRate = SR) {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32); // block align
  buf.writeUInt16LE(16, 34); // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), offset);
    offset += 2;
  }
  return buf;
}

// ---------- run ----------

const files = {
  'click.wav': genClick(),
  'hover.wav': genHover(),
  'whoosh.wav': genWhoosh(),
  'boot.wav': genBoot(),
  'tap.wav': genTap(),
  'success.wav': genSuccess(),
  'transition.wav': genTransition(),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
let totalBytes = 0;
for (const [name, samples] of Object.entries(files)) {
  const buf = encodeWav(samples);
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  totalBytes += buf.length;
  console.log(`${name}: ${(buf.length / 1024).toFixed(1)}KB, ${((samples.length / SR) * 1000).toFixed(0)}ms`);
}
console.log(`total: ${(totalBytes / 1024).toFixed(1)}KB`);
