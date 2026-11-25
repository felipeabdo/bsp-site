import {
  INSTRUMENTS,
  type InstrumentComposition,
  type SoundSlot,
  type Voice,
  createDefaultSoundSlot,
  normalizeComposition,
} from "./music";
import { chordToMidiNotes, midiToFrequency, noteToMidi } from "./music-theory";

export type MusicPreviewOptions = {
  voice: Voice;
  soundSlots: SoundSlot[];
  composition?: InstrumentComposition;
  bpm: number;
  patternOverride?: number[];
  loop?: boolean;
  onStep?: (step: number) => void;
};

let sharedContext: AudioContext | null = null;
let sharedNoiseBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext disponível apenas no navegador.");
  }
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!sharedContext) {
    sharedContext = new AudioCtx();
  }
  if (sharedContext.state === "suspended") {
    void sharedContext.resume();
  }
  return sharedContext;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (sharedNoiseBuffer && sharedNoiseBuffer.sampleRate === ctx.sampleRate) {
    return sharedNoiseBuffer;
  }
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  sharedNoiseBuffer = buffer;
  return buffer;
}

function triggerSynthVoice(
  ctx: AudioContext,
  when: number,
  synth: SoundSlot["synth"],
  velocity: number,
  overrideFreq?: number,
  slideFromFreq?: number,
  durationOverride?: number
) {
  const baseFreq = overrideFreq ?? synth.pitch;
  const decay = durationOverride ?? synth.decay;
  const gainLevel = velocity === 2 ? 0.55 : 0.34;
  const noiseMix = Math.min(100, Math.max(0, synth.noise)) / 100;
  const toneMix = 1 - noiseMix * 0.7;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(
    velocity === 2 ? Math.min(16000, synth.filterHz * 1.25) : synth.filterHz,
    when
  );
  filter.Q.setValueAtTime(1.4, when);
  filter.connect(ctx.destination);

  if (toneMix > 0.05) {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = synth.waveform;

    if (slideFromFreq && slideFromFreq > 0) {
      osc.frequency.setValueAtTime(slideFromFreq, when);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, baseFreq),
        when + Math.min(0.09, decay * 0.4)
      );
    } else if (!overrideFreq && baseFreq < 260) {
      osc.frequency.setValueAtTime(baseFreq * 1.35, when);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, baseFreq), when + 0.045);
    } else {
      osc.frequency.setValueAtTime(Math.max(20, baseFreq), when);
    }

    oscGain.gain.setValueAtTime(0.0001, when);
    oscGain.gain.linearRampToValueAtTime(gainLevel * toneMix, when + 0.006);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, when + decay);

    osc.connect(oscGain);
    oscGain.connect(filter);
    osc.start(when);
    osc.stop(when + decay + 0.02);
  }

  if (noiseMix > 0.02) {
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = synth.filterHz > 3500 ? "highpass" : "bandpass";
    noiseFilter.frequency.setValueAtTime(synth.filterHz, when);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, when);
    noiseGain.gain.linearRampToValueAtTime(gainLevel * noiseMix * 0.85, when + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.05, decay * 0.85));

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(when);
    noise.stop(when + decay + 0.02);
  }
}

export async function startMusicPreview(options: MusicPreviewOptions): Promise<() => void> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const instrument = INSTRUMENTS.find((item) => item.id === options.voice) ?? INSTRUMENTS[0];
  const slots = options.soundSlots.length
    ? options.soundSlots
    : [createDefaultSoundSlot(instrument)];
  const comp = normalizeComposition(options.composition);
  const bpm = Math.min(260, Math.max(40, options.bpm || 92));
  const stepSeconds = 60 / bpm / 4;
  const loop = options.loop ?? true;

  let stopped = false;
  let currentStep = 0;
  let nextNoteTime = ctx.currentTime + 0.03;
  let activeChordSymbol = "";
  let timerId: ReturnType<typeof setInterval> | null = null;
  const uiTimers: ReturnType<typeof setTimeout>[] = [];

  function scheduleStep(step: number, when: number) {
    slots.forEach((slot, slotIdx) => {
      const pattern =
        slotIdx === 0 && options.patternOverride ? options.patternOverride : slot.pattern;
      const velocity = pattern[step] ?? 0;
      if (velocity > 0) {
        triggerSynthVoice(ctx, when, slot.synth, velocity);
      }
    });

    const baseSynth = slots[0].synth;

    const trebleNote = comp.notes[step]?.trim();
    if (trebleNote) {
      const midi = noteToMidi(trebleNote);
      if (midi !== null) {
        const freq = midiToFrequency(midi);
        const tech = comp.techniques[step];
        const prevNote = step > 0 ? comp.notes[step - 1]?.trim() : "";
        const prevMidi = prevNote ? noteToMidi(prevNote) : null;
        const slideFrom =
          tech === "slide" && prevMidi !== null ? midiToFrequency(prevMidi) : undefined;
        triggerSynthVoice(
          ctx,
          when,
          baseSynth,
          tech === "hammer" ? 1 : 2,
          freq,
          slideFrom,
          Math.max(baseSynth.decay, stepSeconds * 1.4)
        );
      }
    }

    const bassNote = comp.bassNotes[step]?.trim();
    if (bassNote) {
      const midi = noteToMidi(bassNote);
      if (midi !== null) {
        const freq = midiToFrequency(midi);
        const tech = comp.bassTechniques[step];
        const prevNote = step > 0 ? comp.bassNotes[step - 1]?.trim() : "";
        const prevMidi = prevNote ? noteToMidi(prevNote) : null;
        const slideFrom =
          tech === "slide" && prevMidi !== null ? midiToFrequency(prevMidi) : undefined;
        triggerSynthVoice(
          ctx,
          when,
          { ...baseSynth, filterHz: Math.min(baseSynth.filterHz, 520) },
          tech === "hammer" ? 1 : 2,
          freq,
          slideFrom,
          Math.max(baseSynth.decay, stepSeconds * 1.8)
        );
      }
    }

    if (comp.chords[step]?.trim()) {
      activeChordSymbol = comp.chords[step].trim();
    }
    const strumVelocity = comp.guitarBase[step] ?? 0;
    if (strumVelocity > 0 && activeChordSymbol) {
      const chordMidis = chordToMidiNotes(activeChordSymbol, 3);
      if (chordMidis) {
        chordMidis.forEach((midi, idx) => {
          triggerSynthVoice(
            ctx,
            when + idx * 0.012,
            baseSynth,
            strumVelocity,
            midiToFrequency(midi),
            undefined,
            Math.max(0.14, stepSeconds * 1.2)
          );
        });
      }
    }

    const delayMs = Math.max(0, (when - ctx.currentTime) * 1000);
    const uiTimer = setTimeout(() => {
      if (!stopped) options.onStep?.(step);
    }, delayMs);
    uiTimers.push(uiTimer);
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    if (timerId !== null) clearInterval(timerId);
    uiTimers.forEach(clearTimeout);
    options.onStep?.(-1);
  }

  const scheduler = () => {
    if (stopped) return;
    while (nextNoteTime < ctx.currentTime + 0.1) {
      if (!loop && currentStep >= 16) {
        const endDelay = Math.max(0, (nextNoteTime - ctx.currentTime) * 1000);
        const endTimer = setTimeout(stop, endDelay);
        uiTimers.push(endTimer);
        if (timerId !== null) clearInterval(timerId);
        return;
      }

      const stepToPlay = currentStep % 16;
      if (stepToPlay === 0) activeChordSymbol = "";
      scheduleStep(stepToPlay, nextNoteTime);

      nextNoteTime += stepSeconds;
      currentStep += 1;
    }
  };

  scheduler();
  timerId = setInterval(scheduler, 25);

  return stop;
}
