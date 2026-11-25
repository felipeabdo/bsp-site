"use client";

import { useEffect, useRef, useState } from "react";
import { INSTRUMENTS } from "@/lib/music";
import { chordToMidiNotes, midiToFrequency, noteToMidi } from "@/lib/music-theory";

type PrivateAssignment = {
  id: number;
  title: string;
  instrument: string;
  bpm: number;
  pattern: number[];
  composition?: { notes?: string[]; bassNotes?: string[]; chords?: string[]; techniques?: string[]; bassTechniques?: string[]; guitarBase?: number[] } | null;
  description: string | null;
  assignedBy: string;
  createdAt: string;
};

const STEP_NAMES = ["1", "e", "+", "a", "2", "e", "+", "a", "3", "e", "+", "a", "4", "e", "+", "a"];
function frequency(note: string) {
  const midi = noteToMidi(note);
  return midi === null ? null : midiToFrequency(midi);
}
function chordFrequency(chord: string, instrument: string) {
  const notes = chordToMidiNotes(chord, instrument === "baixo" ? 2 : 3);
  if (!notes) return null;
  return (instrument === "baixo" ? notes.slice(0, 1) : notes).map(midiToFrequency);
}

export default function PrivateAssignments() {
  const [assignments, setAssignments] = useState<PrivateAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<number | null>(null);
  const [step, setStep] = useState(-1);
  const audioRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextTimeRef = useRef(0);
  const stepRef = useRef(0);
  const activeAssignmentRef = useRef<PrivateAssignment | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/music/assignments", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Não foi possível carregar seus estudos.");
      return await response.json() as { assignments?: PrivateAssignment[] };
    }).then((data) => { if (!cancelled) setAssignments(data.assignments ?? []); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar estudos."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    activeAssignmentRef.current = null;
    setPlaying(null); setStep(-1);
    if (audioRef.current) { audioRef.current.close().catch(() => {}); audioRef.current = null; }
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    audioRef.current?.close().catch(() => {});
  }, []);

  async function play(assignment: PrivateAssignment) {
    if (playing === assignment.id) { stop(); return; }
    stop();
    const context = new AudioContext();
    if (context.state === "suspended") await context.resume();
    audioRef.current = context;
    activeAssignmentRef.current = assignment;
    setPlaying(assignment.id);
    stepRef.current = 0;
    nextTimeRef.current = context.currentTime + 0.08;
    const baseByInstrument: Record<string, number> = { surdo: 75, dobra: 115, martelo: 165, repinique: 340, timbal: 520, caixa: 210, guira: 720, agogo: 920, baixo: 55, guitarra: 210, metais: 420, voz: 280 };
    timerRef.current = setInterval(() => {
      const ctx = audioRef.current;
      const current = activeAssignmentRef.current;
      if (!ctx || !current) return;
      while (nextTimeRef.current < ctx.currentTime + 0.12) {
        const currentStep = stepRef.current;
        const at = nextTimeRef.current;
        const velocity = current.pattern[currentStep] ?? 0;
        const note = current.composition?.notes?.[currentStep];
        const bassNote = current.composition?.bassNotes?.[currentStep];
        const chord = current.composition?.chords?.[currentStep];
        if (velocity) {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          oscillator.type = current.instrument === "guira" || current.instrument === "caixa" ? "square" : "sine";
          oscillator.frequency.setValueAtTime(baseByInstrument[current.instrument] ?? 180, at);
          oscillator.frequency.exponentialRampToValueAtTime(Math.max(35, (baseByInstrument[current.instrument] ?? 180) * 0.65), at + 0.12);
          gain.gain.setValueAtTime(0.0001, at); gain.gain.exponentialRampToValueAtTime(velocity === 2 ? 0.18 : 0.1, at + 0.004); gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16);
          oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(at); oscillator.stop(at + 0.18);
        }
        for (const [noteName, technique] of [
          [note, current.composition?.techniques?.[currentStep] ?? "none"],
          [bassNote, current.composition?.bassTechniques?.[currentStep] ?? "none"],
        ] as const) {
          const noteHz = noteName ? frequency(noteName) : null;
          if (!noteHz) continue;
          const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
          oscillator.type = current.instrument === "metais" ? "sawtooth" : current.instrument === "guitarra" ? "sawtooth" : "triangle";
          oscillator.frequency.setValueAtTime(technique === "slide" ? noteHz * 0.55 : technique === "hammer" ? noteHz * 0.88 : noteHz, at);
          if (technique === "slide") oscillator.frequency.exponentialRampToValueAtTime(noteHz, at + 0.16);
          if (technique === "hammer") oscillator.frequency.exponentialRampToValueAtTime(noteHz, at + 0.04);
          gain.gain.setValueAtTime(0.0001, at); gain.gain.exponentialRampToValueAtTime(0.12, at + 0.008); gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.15);
          oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(at); oscillator.stop(at + 0.17);
        }
        let activeChord = chord;
        const guitarVelocity = current.composition?.guitarBase?.[currentStep] ?? 0;
        if (current.instrument === "guitarra" && guitarVelocity && !activeChord) {
          for (let offset = 1; offset <= 16; offset++) {
            const previousChord = current.composition?.chords?.[(currentStep - offset + 16) % 16];
            if (previousChord) { activeChord = previousChord; break; }
          }
        }
        const chordHz = activeChord ? chordFrequency(activeChord, current.instrument) : null;
        chordHz?.forEach((hz) => {
          const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
          oscillator.type = "triangle"; oscillator.frequency.setValueAtTime(hz, at);
          const volume = current.instrument === "guitarra" && guitarVelocity ? (guitarVelocity === 2 ? 0.075 : 0.05) : 0.045;
          gain.gain.setValueAtTime(0.0001, at); gain.gain.exponentialRampToValueAtTime(volume, at + 0.008); gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
          oscillator.connect(gain); gain.connect(ctx.destination); oscillator.start(at); oscillator.stop(at + 0.22);
        });
        setTimeout(() => setStep(currentStep), Math.max(0, (at - ctx.currentTime) * 1000));
        nextTimeRef.current += 60 / current.bpm / 4;
        stepRef.current = (currentStep + 1) % 16;
      }
    }, 25);
  }

  return <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-tinta/10 sm:p-8">
    <div><span className="chip bg-sol-100 text-sol-700">Área do integrante</span><h2 className="font-display mt-3 text-3xl text-lago sm:text-4xl">Meus estudos e arranjos</h2><p className="mt-2 max-w-2xl text-sm text-tinta/70">Aqui aparecem somente as batidas e orientações que o administrador enviou para o seu ID. Esse material não é exibido no simulador público.</p></div>
    {error && <p role="alert" className="mt-5 rounded-xl bg-sol-100 p-3 text-sm text-sol-700">{error}</p>}
    {loading ? <p className="mt-6 text-sm text-tinta/60">Carregando seus materiais…</p> : assignments.length ? <div className="mt-6 space-y-4">{assignments.map((assignment) => <article key={assignment.id} className="rounded-3xl bg-areia/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-lago">{INSTRUMENTS.find((instrument) => instrument.id === assignment.instrument)?.name ?? assignment.instrument} · {assignment.bpm} BPM</p><h3 className="font-display mt-1 text-2xl text-tinta">{assignment.title}</h3><p className="mt-1 text-xs text-tinta/50">Enviado em {new Date(assignment.createdAt).toLocaleDateString("pt-BR")}</p></div><button type="button" className="btn btn-sol" onClick={() => void play(assignment)}>{playing === assignment.id ? "■ Parar" : "▶ Ouvir estudo"}</button></div>
      {assignment.description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-tinta/75">{assignment.description}</p>}
      <div className="step-grid-16 mt-4">{assignment.pattern.map((value, index) => <div key={index} className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-bold ${step === index && playing === assignment.id ? "ring-2 ring-tinta ring-offset-2" : ""} ${value === 2 ? "bg-sol text-creme" : value === 1 ? "bg-lago text-creme" : "bg-white/80 text-tinta/25"}`}><span>{STEP_NAMES[index]}</span></div>)}</div>
      {assignment.composition?.notes?.some(Boolean) && <p className="mt-3 text-xs text-tinta/65"><strong>Melodia · clave de sol:</strong> {assignment.composition.notes.map((note, index) => note ? `${index + 1}: ${note}` : null).filter(Boolean).join(" · ")}</p>}
      {assignment.composition?.bassNotes?.some(Boolean) && <p className="mt-1 text-xs text-tinta/65"><strong>Melodia · clave de fá:</strong> {assignment.composition.bassNotes.map((note, index) => note ? `${index + 1}: ${note}` : null).filter(Boolean).join(" · ")}</p>}
      {assignment.composition?.chords?.some(Boolean) && <p className="mt-1 text-xs text-tinta/65"><strong>Acordes:</strong> {assignment.composition.chords.map((chord, index) => chord ? `${index + 1}: ${chord}` : null).filter(Boolean).join(" · ")}</p>}
    </article>)}</div> : <div className="mt-6 rounded-3xl bg-areia p-6"><h3 className="font-display text-xl text-lago">Ainda não há estudos enviados</h3><p className="mt-1 text-sm text-tinta/65">Quando o mestre ou administrador enviar uma batida para o seu ID, ela aparecerá aqui.</p></div>}
  </section>;
}
