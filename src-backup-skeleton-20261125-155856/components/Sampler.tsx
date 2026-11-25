"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spiral } from "@/components/art";
import { BPM_DEFAULT, INSTRUMENTS, createDefaultSoundSlot, normalizeComposition, normalizeSoundSlots, type Instrument, type InstrumentComposition, type SoundSlot, type Voice } from "@/lib/music";
import { chordToMidiNotes, midiToFrequency, noteToMidi } from "@/lib/music-theory";

type Ctx = AudioContext;
type InstrumentConfig = { soundSlots: SoundSlot[]; composition: InstrumentComposition };
type MusicResponse = { instruments?: Partial<Record<Voice, { soundSlots?: SoundSlot[]; composition?: InstrumentComposition }>> };

function noiseBuffer(ctx: Ctx) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function env(ctx: Ctx, t: number, peak: number, decay: number, dest: AudioNode) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.05, decay));
  g.connect(dest);
  return g;
}

function midiFrequency(value: string) {
  const midi = noteToMidi(value);
  return midi === null ? null : midiToFrequency(midi);
}

function chordFrequencies(value: string, voice: Voice) {
  const notes = chordToMidiNotes(value, voice === "baixo" ? 2 : 3);
  if (!notes) return null;
  // O baixo sustenta a fundamental/inversão; a guitarra executa a abertura completa.
  return (voice === "baixo" ? notes.slice(0, 1) : notes).map(midiToFrequency);
}

function playSynthSlot(ctx: Ctx, out: AudioNode, nb: AudioBuffer, voice: Voice, slot: SoundSlot, at: number, velocity: number, step: number) {
  const { pitch, decay, filterHz, noise: noisePercent } = slot.synth;
  const power = velocity === 2 ? 1 : 0.62;
  const hit = (frequency: number, level: number, seconds: number, type: OscillatorType = "sine", end?: number, cutoff = filterHz) => {
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass"; filter.frequency.setValueAtTime(cutoff, at); filter.Q.value = voice === "agogo" ? 2 : 0.65;
    oscillator.type = type; oscillator.frequency.setValueAtTime(Math.max(22, frequency), at);
    if (end && end !== frequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(22, end), at + Math.min(seconds * 0.72, 0.28));
    oscillator.connect(filter); filter.connect(env(ctx, at, level * power, seconds, out));
    oscillator.start(at); oscillator.stop(at + seconds + 0.03);
  };
  const noiseHit = (level: number, seconds: number, filterType: BiquadFilterType, cutoff: number, when = at) => {
    const source = ctx.createBufferSource(); const filter = ctx.createBiquadFilter();
    filter.type = filterType; filter.frequency.setValueAtTime(cutoff, when); filter.Q.value = filterType === "bandpass" ? 1.2 : 0.7;
    source.buffer = nb; source.connect(filter); filter.connect(env(ctx, when, level * power, seconds, out));
    source.start(when); source.stop(when + seconds + 0.02);
  };

  if (voice === "surdo" || voice === "dobra" || voice === "martelo") {
    const fall = voice === "surdo" ? 0.43 : voice === "dobra" ? 0.58 : 0.72;
    hit(pitch, 0.42, decay, "sine", pitch * fall, Math.min(filterHz, 1400));
    hit(pitch * 1.48, 0.06, Math.min(decay * 0.48, 0.18), "triangle", pitch * 1.05, 2400);
    noiseHit(voice === "martelo" ? 0.11 : 0.035, 0.026, "bandpass", 1700);
    return;
  }
  if (voice === "repinique" || voice === "timbal") {
    hit(pitch, 0.35, decay, "triangle", pitch * (voice === "repinique" ? 0.82 : 0.7), filterHz);
    hit(pitch * 2.72, 0.085, decay * 0.42, "sine", undefined, filterHz);
    noiseHit(0.06 + noisePercent / 100 * 0.18, 0.034, "highpass", Math.max(1100, filterHz * 0.45));
    return;
  }
  if (voice === "caixa") {
    hit(pitch, 0.055, Math.min(decay, 0.12), "triangle", pitch * 0.8, 1200);
    noiseHit(0.26, Math.min(0.15, decay * 1.1), "highpass", 1600);
    return;
  }
  if (voice === "guira") {
    noiseHit(0.28, Math.min(0.14, decay * 1.4), "bandpass", Math.min(9000, Math.max(2200, filterHz * 0.72)));
    noiseHit(0.13, Math.min(0.1, decay), "highpass", 4200, at + 0.024);
    return;
  }
  if (voice === "agogo") {
    const bell = pitch * (step % 8 === 0 || step % 8 === 4 ? 1.5 : 1);
    [1, 2.76, 5.4].forEach((ratio, index) => hit(bell * ratio, [0.27, 0.1, 0.035][index], decay * [1, 0.64, 0.42][index], "sine", undefined, filterHz));
    return;
  }
  // String family: a Karplus-Strong style pluck gives a decaying string body.
  const base = voice === "baixo" ? pitch * 0.5 : pitch;
  if (voice === "baixo" || voice === "guitarra") {
    playPluckedString(ctx, out, base, at, decay, power, voice === "baixo" ? 0.38 : 0.66);
    return;
  }
  hit(base, 0.32, decay, "triangle", base * 0.995, filterHz);
  hit(base * 2.01, 0.11, decay * 0.45, "sine", undefined, filterHz);
  hit(base * 3.02, 0.04, decay * 0.22, "sine", undefined, filterHz);
  if (voice === "metais") {
    hit(base * 1.006, 0.06, decay * 0.82, "sawtooth", undefined, Math.min(filterHz, 4200));
    noiseHit(0.025, 0.025, "bandpass", 1800);
  }
}
function playSample(ctx: Ctx, out: AudioNode, buffer: AudioBuffer, at: number, velocity: number, slot: SoundSlot) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(Math.pow(2, slot.samplePlayback.pitchSemitones / 12), at);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity === 2 ? 1 : 0.68, at);
  source.connect(gain); gain.connect(out);
  source.start(at);
  if (slot.samplePlayback.durationSeconds > 0) source.stop(at + slot.samplePlayback.durationSeconds);
}

function playPluckedString(ctx: Ctx, out: AudioNode, frequency: number, at: number, duration: number, velocity = 1, brightness = 0.62) {
  const delay = ctx.createDelay(0.08);
  const filter = ctx.createBiquadFilter();
  const feedback = ctx.createGain();
  const level = ctx.createGain();
  const excitation = ctx.createBufferSource();
  const burst = ctx.createBuffer(1, Math.max(64, Math.floor(ctx.sampleRate * 0.022)), ctx.sampleRate);
  const data = burst.getChannelData(0);
  for (let index = 0; index < data.length; index++) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  excitation.buffer = burst;
  delay.delayTime.value = Math.max(1 / ctx.sampleRate, Math.min(0.075, 1 / Math.max(28, frequency)));
  filter.type = "lowpass";
  filter.frequency.value = Math.min(10500, Math.max(700, frequency * (5 + brightness * 9)));
  filter.Q.value = 0.55;
  feedback.gain.value = brightness > 0.7 ? 0.955 : 0.925;
  level.gain.setValueAtTime(0.0001, at);
  level.gain.exponentialRampToValueAtTime(0.2 * velocity, at + 0.004);
  level.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(0.09, duration));
  excitation.connect(delay);
  delay.connect(filter);
  filter.connect(feedback);
  feedback.connect(delay);
  filter.connect(level);
  level.connect(out);
  excitation.start(at);
  excitation.stop(at + 0.022);
  window.setTimeout(() => {
    try { excitation.disconnect(); delay.disconnect(); filter.disconnect(); feedback.disconnect(); level.disconnect(); } catch { /* nós já finalizados */ }
  }, Math.max(100, (at - ctx.currentTime + duration + 0.2) * 1000));
}

function playMelodyNote(ctx: Ctx, out: AudioNode, voice: Voice, note: string, technique: string, at: number, duration: number, velocity = 1) {
  const frequency = midiFrequency(note);
  if (!frequency) return;
  if (voice === "baixo" || voice === "guitarra") {
    const startFrequency = technique === "slide" ? frequency * 0.55 : technique === "hammer" ? frequency * 0.88 : frequency;
    playPluckedString(ctx, out, startFrequency, at, duration, velocity === 2 ? 1.3 : 1, voice === "baixo" ? 0.4 : 0.68);
    return;
  }
  const oscillator = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  oscillator.type = voice === "metais" ? "sawtooth" : "triangle";
  filter.type = "lowpass";
  filter.frequency.value = voice === "metais" ? 4200 : 900;
  const startFrequency = technique === "slide" ? frequency * 0.55 : technique === "hammer" ? frequency * 0.88 : frequency;
  oscillator.frequency.setValueAtTime(startFrequency, at);
  if (technique === "slide") oscillator.frequency.exponentialRampToValueAtTime(frequency, at + Math.min(0.2, duration * 0.55));
  if (technique === "hammer") oscillator.frequency.exponentialRampToValueAtTime(frequency, at + Math.min(0.045, duration * 0.18));
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.18 * (velocity === 2 ? 1.35 : 1), at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(filter); filter.connect(gain); gain.connect(out);
  oscillator.start(at); oscillator.stop(at + duration + 0.03);
}

function playChord(ctx: Ctx, out: AudioNode, voice: Voice, chord: string, at: number, velocity = 1) {
  const frequencies = chordFrequencies(chord, voice);
  if (!frequencies) return;
  frequencies.forEach((frequency, index) => {
    const noteAt = at + index * (voice === "baixo" ? 0 : 0.008);
    if (voice === "guitarra" || voice === "baixo") {
      playPluckedString(ctx, out, frequency, noteAt, voice === "baixo" ? 0.42 : 0.24, velocity === 2 ? 1.25 : 1, voice === "baixo" ? 0.38 : 0.66);
      return;
    }
    const oscillator = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;
    filter.type = "lowpass"; filter.frequency.value = 2400;
    oscillator.connect(filter);
    filter.connect(env(ctx, noteAt, 0.085 * (velocity === 2 ? 1.35 : 1), 0.19, out));
    oscillator.start(noteAt); oscillator.stop(noteAt + 0.27);
  });
}

const DEFAULT_CONFIGURATIONS = Object.fromEntries(INSTRUMENTS.map((instrument) => [instrument.id, {
  soundSlots: instrument.id === "voz" ? [] : [createDefaultSoundSlot(instrument)],
  composition: normalizeComposition(null),
}])) as Partial<Record<Voice, InstrumentConfig>>;

export default function Sampler({ compact = false, featuredVoices }: { compact?: boolean; featuredVoices?: Voice[] } = {}) {
  const [active, setActive] = useState<Voice[]>([]);
  const [bpm, setBpm] = useState(BPM_DEFAULT);
  const [step, setStep] = useState(-1);
  const [publicSyncing, setPublicSyncing] = useState(false);
  const [lastPublicSync, setLastPublicSync] = useState<number | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>(INSTRUMENTS);
  const [configurations, setConfigurations] = useState<Partial<Record<Voice, InstrumentConfig>>>(DEFAULT_CONFIGURATIONS);
  const ctxRef = useRef<Ctx | null>(null);
  const nbRef = useRef<AudioBuffer | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const activeRef = useRef<Voice[]>([]);
  const instrumentsRef = useRef<Instrument[]>(INSTRUMENTS);
  const configurationsRef = useRef<Partial<Record<Voice, InstrumentConfig>>>(DEFAULT_CONFIGURATIONS);
  const sampleBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const samplePromisesRef = useRef<Map<string, Promise<AudioBuffer | null>>>(new Map());
  const bpmRef = useRef(bpm);
  const nextTime = useRef(0);
  const stepRef = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startGenerationRef = useRef(0);

  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  const refreshPublicConfiguration = useCallback(async () => {
    const response = await fetch("/api/music", { cache: "no-store" });
    if (!response.ok) throw new Error("music config unavailable");
    const data = await response.json() as MusicResponse;
    const configs: Partial<Record<Voice, InstrumentConfig>> = {};
    const next = INSTRUMENTS.map((instrument) => {
      const raw = data.instruments?.[instrument.id];
      const slots = raw?.soundSlots ?? (instrument.id === "voz" ? [] : [createDefaultSoundSlot(instrument)]);
      const normalizedSlots = normalizeSoundSlots(slots, instrument);
      const composition = normalizeComposition(raw?.composition);
      configs[instrument.id] = { soundSlots: normalizedSlots, composition };
      return { ...instrument, pattern: normalizedSlots[0]?.pattern ?? Array(16).fill(0), sample: normalizedSlots.length > 0 };
    });
    sampleBuffersRef.current.clear();
    samplePromisesRef.current.clear();
    configurationsRef.current = configs;
    instrumentsRef.current = next;
    setConfigurations(configs);
    setInstruments(next);
    setLastPublicSync(Date.now());
  }, []);

  const syncPublicNow = async () => {
    setPublicSyncing(true);
    try { await refreshPublicConfiguration(); }
    catch { setLastPublicSync(0); }
    finally { setPublicSyncing(false); }
  };

  useEffect(() => {
    let alive = true;
    const reload = () => { if (alive) void refreshPublicConfiguration().catch(() => undefined); };
    const onVisibility = () => { if (document.visibilityState === "visible") reload(); };
    const onStorage = (event: StorageEvent) => { if (event.key === "bsp:music-public-updated") reload(); };
    reload();
    window.addEventListener("focus", reload);
    window.addEventListener("storage", onStorage);
    window.addEventListener("bsp:music-public-updated", reload);
    document.addEventListener("visibilitychange", onVisibility);
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("bsp-music-public");
      channel.addEventListener("message", reload);
    } catch { /* BroadcastChannel não está disponível em alguns navegadores */ }
    return () => {
      alive = false;
      window.removeEventListener("focus", reload);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bsp:music-public-updated", reload);
      document.removeEventListener("visibilitychange", onVisibility);
      channel?.removeEventListener("message", reload);
      channel?.close();
    };
  }, [refreshPublicConfiguration]);

  const ensureCtx = () => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const master = ctx.createGain(); master.gain.value = 0.85;
      const compressor = ctx.createDynamicsCompressor(); master.connect(compressor); compressor.connect(ctx.destination);
      ctxRef.current = ctx; masterRef.current = master; nbRef.current = noiseBuffer(ctx);
    }
    return ctxRef.current;
  };

  const loadSample = async (ctx: Ctx, voice: Voice, slotId: string): Promise<AudioBuffer | null> => {
    const key = `${voice}:${slotId}`;
    const cached = sampleBuffersRef.current.get(key); if (cached) return cached;
    const pending = samplePromisesRef.current.get(key); if (pending) return pending;
    const task = (async () => {
      try {
        const response = await fetch(`/api/music/${voice}/sounds/${slotId}/sample`, { cache: "no-store" });
        if (!response.ok) return null;
        const bytes = await response.arrayBuffer();
        const decoded = await ctx.decodeAudioData(bytes.slice(0));
        sampleBuffersRef.current.set(key, decoded); return decoded;
      } catch { return null; }
      finally { samplePromisesRef.current.delete(key); }
    })();
    samplePromisesRef.current.set(key, task); return task;
  };

  const stop = useCallback(() => {
    startGenerationRef.current += 1;
    if (timer.current) clearInterval(timer.current);
    timer.current = null; activeRef.current = []; setActive([]); setStep(-1);
  }, []);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); ctxRef.current?.close().catch(() => {}); }, []);

  const startLoop = async () => {
    const generation = ++startGenerationRef.current;
    const ctx = ensureCtx();
    if (ctx.state === "suspended") await ctx.resume();
    const activeConfigs = activeRef.current.flatMap((voice) => (configurationsRef.current[voice]?.soundSlots ?? []).filter((slot) => slot.source === "sample").map((slot) => ({ voice, slotId: slot.id })));
    await Promise.all(activeConfigs.map(({ voice, slotId }) => loadSample(ctx, voice, slotId)));
    if (generation !== startGenerationRef.current || activeRef.current.length === 0 || timer.current) return;
    nextTime.current = ctx.currentTime + 0.08; stepRef.current = 0;
    timer.current = setInterval(() => {
      const current = ctxRef.current; const output = masterRef.current; const noiseSource = nbRef.current;
      if (!current || !output || !noiseSource) return;
      while (nextTime.current < current.currentTime + 0.12) {
        const currentStep = stepRef.current; const at = nextTime.current;
        for (const voice of activeRef.current) {
          const config = configurationsRef.current[voice];
          if (!config) continue;
          for (const sound of config.soundSlots) {
            const velocity = sound.pattern[currentStep] ?? 0;
            if (!velocity) continue;
            const sample = sound.source === "sample" ? sampleBuffersRef.current.get(`${voice}:${sound.id}`) : null;
            if (sample) playSample(current, output, sample, at, velocity, sound);
            else playSynthSlot(current, output, noiseSource, voice, sound, at, velocity, currentStep);
          }
          const duration = Math.max(0.09, 60 / bpmRef.current / 4 * 0.9);
          const trebleNote = config.composition.notes[currentStep];
          const bassNote = config.composition.bassNotes[currentStep];
          if (trebleNote) playMelodyNote(current, output, voice, trebleNote, config.composition.techniques[currentStep], at, duration, 1);
          if (bassNote) playMelodyNote(current, output, voice, bassNote, config.composition.bassTechniques[currentStep], at, duration, 1);
          const chord = config.composition.chords[currentStep];
          if (voice === "baixo" && chord) playChord(current, output, voice, chord, at, 1);
          if (voice === "guitarra") {
            const baseVelocity = config.composition.guitarBase[currentStep];
            if (baseVelocity) {
              let baseChord = chord;
              if (!baseChord) {
                for (let offset = 1; offset <= 16; offset++) {
                  const index = (currentStep - offset + 16) % 16;
                  if (config.composition.chords[index]) { baseChord = config.composition.chords[index]; break; }
                }
              }
              if (baseChord) playChord(current, output, voice, baseChord, at, baseVelocity as 1 | 2);
            } else if (chord) {
              playChord(current, output, voice, chord, at, 1);
            }
          }
        }
        const delay = Math.max(0, (at - current.currentTime) * 1000);
        setTimeout(() => setStep(currentStep), delay);
        nextTime.current += 60 / bpmRef.current / 4;
        stepRef.current = (currentStep + 1) % 16;
      }
    }, 25);
  };

  const toggle = (id: Voice) => {
    const next = activeRef.current.includes(id) ? activeRef.current.filter((voice) => voice !== id) : [...activeRef.current, id];
    activeRef.current = next; setActive(next);
    if (next.length === 0) stop(); else void startLoop();
  };
  const all = () => {
    const ids = instrumentsRef.current.filter((instrument) => visibleVoices.includes(instrument.id)).filter((instrument) => {
      const config = configurationsRef.current[instrument.id];
      if (!config) return false;
      const composition = config.composition;
      const hasWrittenMusic = composition.notes.some(Boolean)
        || composition.bassNotes.some(Boolean)
        || composition.chords.some(Boolean)
        || composition.guitarBase.some((step) => step > 0);
      return config.soundSlots.some((slot) => slot.pattern.some((step) => step > 0)) || hasWrittenMusic;
    }).map((instrument) => instrument.id);
    activeRef.current = ids; setActive(ids); void startLoop();
  };
  const running = active.length > 0;
  const visibleVoices = compact
    ? (featuredVoices ?? ["surdo", "repinique", "timbal", "caixa"] as Voice[])
    : instruments.map((instrument) => instrument.id);
  const visibleInstruments = instruments.filter((instrument) => visibleVoices.includes(instrument.id));

  return (
    <div className="w-full min-w-0">
      {!compact && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lago/10 bg-white/80 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-lago">Arranjos publicados pelo estúdio BSP</p>
            <p className="text-xs text-tinta/55">{lastPublicSync ? `Sincronizado em ${new Date(lastPublicSync).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Carregando os arranjos publicados…"}</p>
          </div>
          <button type="button" onClick={() => void syncPublicNow()} disabled={publicSyncing} className="btn btn-creme">{publicSyncing ? "Atualizando…" : "↻ Atualizar arranjos"}</button>
        </div>
      )}
      {compact ? (
        <div className="relative min-w-0 overflow-hidden rounded-[2rem] bg-lago p-5 text-creme sm:p-7">
          <Spiral className={`pointer-events-none absolute -right-12 -top-14 h-52 w-52 text-sol/30 ${running ? "animate-spin-slow" : ""}`} stroke={7} />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div><span className="chip bg-sol text-creme">Sons & Inspirações</span><h3 className="font-display mt-3 text-3xl sm:text-4xl">Sinta a pressão da bateria</h3><p className="mt-2 max-w-xl text-sm text-creme/80">Uma demonstração interativa dos naipes que dão o pulso e o brilho do Santo Pecado.</p></div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button type="button" onClick={all} className="btn btn-sol">{running ? "▶ Tocar novamente" : "▶ Ouvir a bateria"}</button>
              <button type="button" onClick={stop} className="btn btn-creme" disabled={!running}>Parar</button>
            </div>
          </div>
          <div className="relative mt-5 flex gap-1.5" aria-label="Progresso da batida">{Array.from({ length: 16 }).map((_, index) => <span key={index} className={`h-2.5 flex-1 rounded-full transition-all duration-75 ${step === index ? "scale-y-[1.7] bg-sol" : index % 4 === 0 ? "bg-creme/50" : "bg-creme/20"}`} />)}</div>
        </div>
      ) : (
        <div className="relative min-w-0 overflow-hidden rounded-[2.5rem] bg-tinta p-6 text-creme sm:p-10">
          <Spiral className={`absolute -right-24 -top-24 h-80 w-80 text-sol-600 ${running ? "animate-spin-slow" : ""}`} stroke={7} />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div><span className="chip bg-sol text-creme">Estúdio BSP · simulação em samba-reggae</span><h3 className="font-display mt-4 text-4xl sm:text-5xl">Monte a bateria e aperte o play</h3><p className="mt-3 max-w-xl text-creme/85">Cada instrumento pode combinar vários tipos de som, gravações reais e timbres sintéticos. Guitarra, baixo e metais também podem receber linhas melódicas; a guitarra toca sua batida base e os acordes definidos pelo bloco.</p></div>
            <div className="space-y-5 rounded-3xl bg-creme/10 p-5"><div className="flex flex-wrap gap-3"><button onClick={all} className="btn btn-sol">▶ Banda completa</button><button onClick={stop} className="btn btn-creme" disabled={!running}>■ Parar</button></div><label className="block"><span className="flex justify-between text-sm font-semibold"><span>Andamento</span><span>{bpm} BPM</span></span><input type="range" min={40} max={220} value={bpm} onChange={(event) => setBpm(Number(event.target.value))} className="mt-2 w-full accent-[#F9834E]" /></label><div className="flex gap-1.5" aria-hidden="true">{Array.from({ length: 16 }).map((_, index) => <span key={index} className={`h-3 flex-1 rounded-full transition-all duration-75 ${step === index ? "scale-y-[2] bg-sol" : index % 4 === 0 ? "bg-creme/50" : "bg-creme/20"}`} />)}</div></div>
          </div>
        </div>
      )}
      <ul className={`${compact ? "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" : "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"}`}>{visibleInstruments.map((instrument) => {
        const config = configurations[instrument.id];
        const playable = Boolean(config && (
          config.soundSlots.some((slot) => slot.pattern.some((step) => step > 0))
          || config.composition.notes.some(Boolean)
          || config.composition.bassNotes.some(Boolean)
          || config.composition.chords.some(Boolean)
          || config.composition.guitarBase.some((step) => step > 0)
        ));
        return <InstrumentCard key={instrument.id} inst={instrument} config={config} playable={playable} on={active.includes(instrument.id)} step={step} compact={compact} onToggle={() => toggle(instrument.id)} />;
      })}</ul>
    </div>
  );
}

const CARD = {
  sol: "bg-sol text-creme",
  lago: "bg-lago text-creme",
  areia: "bg-areia text-tinta",
};

function InstrumentCard({ inst, config, playable, on, step, compact = false, onToggle }: { inst: Instrument; config?: InstrumentConfig; playable: boolean; on: boolean; step: number; compact?: boolean; onToggle: () => void }) {
  const dark = inst.color !== "areia";
  return (
    <li className={`relative flex min-w-0 flex-col overflow-hidden rounded-[2rem] ${compact ? "p-5" : "p-6"} ${CARD[inst.color]} ${on ? "ring-4 ring-tinta/80 ring-offset-4 ring-offset-creme" : ""}`}>
      <Spiral className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 opacity-20 ${on ? "animate-spin-slow" : ""}`} stroke={8} />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`grid ${compact ? "h-12 w-12 rounded-xl" : "h-16 w-16 rounded-2xl"} place-items-center ${dark ? "bg-creme text-tinta" : "bg-sol text-creme"} ${on ? "animate-float" : ""}`}>
          <Icon kind={inst.icon} />
        </div>
        {!compact && <span className={`chip ${dark ? "bg-creme/20" : "bg-tinta/10"}`}>{inst.family}</span>}
      </div>
      <h3 className={`font-display relative ${compact ? "mt-3 text-2xl" : "mt-5 text-3xl"}`}>{inst.name}</h3>
      <p className={`relative text-sm font-bold uppercase tracking-wider ${dark ? "text-creme/80" : "text-sol-600"}`}>{inst.role}</p>
      {!compact && <p className="relative mt-3 flex-1 leading-relaxed opacity-95">{inst.detail}</p>}

      {playable ? (
        <>
          {!compact && (
            <div className="relative mt-5 space-y-2" aria-label="Padrões públicos salvos">
              {(config?.soundSlots ?? []).slice(0, 10).map((slot) => (
                <div key={slot.id}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider opacity-80"><span className="truncate">{slot.name}</span><span>{slot.source === "sample" ? "Áudio real" : "Timbre BSP"}</span></div>
                  <div className="public-pattern-grid w-full min-w-0">{slot.pattern.map((value, index) => <span key={index} className={`h-2.5 rounded-sm transition ${on && step === index ? "ring-2 ring-tinta" : ""} ${value === 2 ? (dark ? "bg-sol" : "bg-sol-700") : value === 1 ? (dark ? "bg-creme/80" : "bg-lago") : dark ? "bg-creme/15" : "bg-tinta/10"}`} />)}</div>
                </div>
              ))}
              {config?.composition.notes.some(Boolean) && <p className="pt-1 text-xs font-semibold opacity-90">♫ Melodia: {config.composition.notes.filter(Boolean).slice(0, 4).join(" · ")}{config.composition.notes.filter(Boolean).length > 4 ? " …" : ""}</p>}
              {config?.composition.bassNotes.some(Boolean) && <p className="text-xs font-semibold opacity-90">♫ Linha grave: {config.composition.bassNotes.filter(Boolean).slice(0, 4).join(" · ")}{config.composition.bassNotes.filter(Boolean).length > 4 ? " …" : ""}</p>}
              {config?.composition.chords.some(Boolean) && <p className="text-xs font-semibold opacity-90">Acordes: {config.composition.chords.filter(Boolean).slice(0, 4).join(" · ")}{config.composition.chords.filter(Boolean).length > 4 ? " …" : ""}</p>}
              {config?.composition.guitarBase.some((step) => step > 0) && <p className="text-xs font-semibold opacity-90">↗ Batida base de acompanhamento publicada</p>}
            </div>
          )}
          <button onClick={onToggle} className={`btn relative mt-4 ${on ? "btn-creme" : dark ? "btn-creme" : "btn-sol"}`} aria-pressed={on}>
            {on ? "■ Parar" : compact ? "▶ Ouvir este naipe" : "▶ Ouvir no samba-reggae"}
          </button>
        </>
      ) : (
        <p className="chip relative mt-5 w-fit bg-tinta/10">Só ao vivo · sem amostra</p>
      )}
    </li>
  );
}

function Icon({ kind }: { kind: Instrument["icon"] }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9" aria-hidden="true" {...p}>
      {kind === "drum-tall" && (
        <>
          <ellipse cx="24" cy="10" rx="12" ry="4" />
          <path d="M12 10v24c0 6 6 6 12 6s12 0 12-6V10" />
          <path d="M14 14l6 22M34 14l-6 22M24 14v26" opacity=".6" />
        </>
      )}
      {kind === "drum-small" && (
        <>
          <ellipse cx="24" cy="16" rx="15" ry="5" />
          <path d="M9 16v12c0 6 7 7 15 7s15-1 15-7V16" />
          <path d="M38 6l-8 10M10 6l8 10" />
        </>
      )}
      {kind === "snare" && (
        <>
          <ellipse cx="24" cy="18" rx="16" ry="5" />
          <path d="M8 18v8c0 5 8 6 16 6s16-1 16-6v-8" />
          <path d="M14 36l-4 8M34 36l4 8" />
        </>
      )}
      {kind === "bell" && (
        <>
          <path d="M10 10h14v10L10 34h0" />
          <path d="M24 20l14 14" />
          <circle cx="38" cy="36" r="4" />
          <circle cx="10" cy="34" r="4" />
        </>
      )}
      {kind === "shaker" && (
        <>
          <rect x="16" y="6" width="16" height="24" rx="8" />
          <path d="M24 30v12M20 14h8M20 20h8" />
        </>
      )}
      {kind === "guitar" && (
        <>
          <path d="M30 6l12 12M26 10l12 12M33 15L20 28" />
          <circle cx="14" cy="34" r="8" />
          <circle cx="14" cy="34" r="2" />
        </>
      )}
      {kind === "horn" && (
        <>
          <path d="M6 20h10l18-10v28L16 28H6z" />
          <path d="M40 18c3 2 3 10 0 12" />
        </>
      )}
      {kind === "mic" && (
        <>
          <rect x="17" y="5" width="14" height="22" rx="7" />
          <path d="M10 22c0 8 6 12 14 12s14-4 14-12M24 34v8M17 42h14" />
        </>
      )}
    </svg>
  );
}
