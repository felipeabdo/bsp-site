"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  BPM_DEFAULT,
  EMPTY_COMPOSITION,
  INSTRUMENTS,
  createDefaultSoundSlot,
  normalizeComposition,
  normalizeSoundSlots,
  type InstrumentComposition,
  type SoundSlot,
  type SynthWaveform,
  type Voice,
} from "@/lib/music";
import MusicStaveEditor from "@/components/MusicStaveEditor";
import { CHORD_EXAMPLES, isValidChordSymbol } from "@/lib/music-theory";
import { startMusicPreview } from "@/lib/music-preview";

type StudioItem = { id: Voice; name: string; family: string; soundSlots: SoundSlot[]; composition: InstrumentComposition };
type ApiResponse = {
  instruments?: Partial<Record<Voice, { soundSlots: SoundSlot[]; composition: InstrumentComposition }>>;
  samples?: { voice: Voice; slotId: string; name: string }[];
  legacySamples?: { voice: Voice; name: string }[];
};
type Assignment = { id: number; title: string; instrument: string; recipientMemberId: string; createdAt: string; description: string | null };

const STEP_NAMES = ["1", "e", "+", "a", "2", "e", "+", "a", "3", "e", "+", "a", "4", "e", "+", "a"];
const STEP_GRID_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(8, minmax(0, 1fr))",
  gridTemplateRows: "repeat(2, minmax(48px, auto))",
  width: "100%",
  maxWidth: "720px",
  minWidth: 0,
  gap: "clamp(4px, 1vw, 9px)",
  alignSelf: "stretch",
  justifySelf: "center",
  marginInline: "auto",
  gridAutoFlow: "row",
};

function emptyItem(instrument: (typeof INSTRUMENTS)[number]): StudioItem {
  return {
    id: instrument.id,
    name: instrument.name,
    family: instrument.family,
    soundSlots: instrument.id === "voz" ? [] : [createDefaultSoundSlot(instrument)],
    composition: normalizeComposition(EMPTY_COMPOSITION),
  };
}

function normalizePattern(value: unknown) {
  return Array.isArray(value) ? Array.from({ length: 16 }, (_, index) => value[index] === 1 || value[index] === 2 ? value[index] : 0) : Array(16).fill(0);
}

export default function MusicStudioAdmin() {
  const [items, setItems] = useState<StudioItem[]>(() => INSTRUMENTS.map(emptyItem));
  const [selected, setSelected] = useState<Voice>("surdo");
  const selectedRef = useRef(selected);
  const [selectedSlotId, setSelectedSlotId] = useState("sound-1");
  const [sampleNames, setSampleNames] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<"public" | "private">("public");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [privateTitle, setPrivateTitle] = useState("Estudo de instrumento");
  const [privateVoice, setPrivateVoice] = useState<Voice>("surdo");
  const [recipientIds, setRecipientIds] = useState("");
  const [privateDescription, setPrivateDescription] = useState("");
  const [privateBpm, setPrivateBpm] = useState(BPM_DEFAULT);
  const [privatePattern, setPrivatePattern] = useState<number[]>(Array(16).fill(0));
  const [privateComposition, setPrivateComposition] = useState<InstrumentComposition>(() => normalizeComposition(EMPTY_COMPOSITION));
  const [previewStep, setPreviewStep] = useState(-1);
  const [privatePreviewStep, setPrivatePreviewStep] = useState(-1);
  const previewStopRef = useRef<(() => void) | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sending, setSending] = useState(false);
  const samplePreviewCacheRef = useRef<Map<string, Promise<AudioBuffer | null>>>(new Map());

  const current = useMemo(() => items.find((item) => item.id === selected) ?? items[0], [items, selected]);
  const currentSlot = current?.soundSlots.find((slot) => slot.id === selectedSlotId) ?? current?.soundSlots[0] ?? null;
  const isString = selected === "baixo" || selected === "guitarra";
  const isWind = selected === "metais";

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => () => { previewStopRef.current?.(); }, []);

  const applyApiData = useCallback((data: ApiResponse) => {
    const nextItems = INSTRUMENTS.map((instrument) => {
      const config = data.instruments?.[instrument.id];
      const fallback = emptyItem(instrument);
      return {
        ...fallback,
        soundSlots: Array.isArray(config?.soundSlots) ? config!.soundSlots.map((slot) => ({ ...slot, pattern: normalizePattern(slot.pattern), synth: { ...slot.synth } })) : fallback.soundSlots,
        composition: config?.composition ? normalizeComposition(config.composition) : fallback.composition,
      };
    });
    const names: Record<string, string> = {};
    for (const sample of data.samples ?? []) names[`${sample.voice}:${sample.slotId}`] = sample.name;
    for (const sample of data.legacySamples ?? []) names[`${sample.voice}:sound-1`] ??= sample.name;
    setItems(nextItems);
    setSampleNames(names);
    const first = nextItems.find((item) => item.id === selectedRef.current) ?? nextItems[0];
    setSelectedSlotId((previous) => first.soundSlots.some((slot) => slot.id === previous) ? previous : (first.soundSlots[0]?.id ?? ""));
    setError(false);
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch("/api/music", { cache: "no-store" });
      if (!response.ok) throw new Error("Não foi possível carregar os sons salvos.");
      applyApiData(await response.json() as ApiResponse);
      await refreshAssignments();
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Erro ao carregar o estúdio.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshAssignments() {
    try {
      const response = await fetch("/api/music/assignments", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json() as { assignments?: Assignment[] };
      setAssignments(data.assignments ?? []);
    } catch { /* mantém a lista atual se a rede oscilar */ }
  }

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetch("/api/music", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os sons salvos.");
        return await response.json() as ApiResponse;
      }),
      fetch("/api/music/assignments", { cache: "no-store" }).then(async (response) => response.ok ? await response.json() as { assignments?: Assignment[] } : { assignments: [] }),
    ]).then(([data, privateData]) => {
      if (!alive) return;
      applyApiData(data);
      setAssignments(privateData.assignments ?? []);
    }).catch((err: unknown) => {
      if (!alive) return;
      setError(true);
      setMessage(err instanceof Error ? err.message : "Erro ao carregar o estúdio.");
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [applyApiData]);

  function stopArrangementPreview() {
    previewStopRef.current?.();
    previewStopRef.current = null;
    setPreviewStep(-1);
    setPrivatePreviewStep(-1);
  }

  async function previewPublicArrangement() {
    if (!current) return;
    if (previewStopRef.current) { stopArrangementPreview(); return; }
    try {
      const stop = await startMusicPreview({
        voice: selected,
        soundSlots: current.soundSlots,
        composition: current.composition,
        bpm: BPM_DEFAULT,
        onStep: (step) => { setPreviewStep(step); if (step < 0) previewStopRef.current = null; },
      });
      previewStopRef.current = stop;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível pré-ouvir o arranjo.");
      setError(true);
    }
  }

  async function previewPrivateArrangement() {
    if (previewStopRef.current) { stopArrangementPreview(); return; }
    const source = items.find((item) => item.id === privateVoice);
    const selectedInstrument = INSTRUMENTS.find((item) => item.id === privateVoice)!;
    const previewSlots = source?.soundSlots.length ? source.soundSlots : [createDefaultSoundSlot(selectedInstrument)];
    try {
      const stop = await startMusicPreview({
        voice: privateVoice,
        soundSlots: [{ ...previewSlots[0], pattern: [...privatePattern] }],
        composition: privateComposition,
        bpm: privateBpm,
        patternOverride: privatePattern,
        onStep: (step) => { setPrivatePreviewStep(step); if (step < 0) previewStopRef.current = null; },
      });
      previewStopRef.current = stop;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Não foi possível pré-ouvir o estudo.");
      setError(true);
    }
  }

  function updatePrivateCell(index: number) {
    if (previewStopRef.current) stopArrangementPreview();
    const nextPattern = privatePattern.map((old, cell) => cell === index ? (old + 1) % 3 : old);
    setPrivatePattern(nextPattern);
    if (nextPattern[index] > 0) {
      const source = items.find((item) => item.id === privateVoice);
      const instrument = INSTRUMENTS.find((item) => item.id === privateVoice)!;
      const slot = source?.soundSlots[0] ?? createDefaultSoundSlot(instrument);
      void startMusicPreview({
        voice: privateVoice,
        soundSlots: [{ ...slot, pattern: [nextPattern[index], ...Array(15).fill(0)] }],
        composition: normalizeComposition(EMPTY_COMPOSITION),
        bpm: 220,
        onStep: (step) => { setPrivatePreviewStep(step); if (step < 0) previewStopRef.current = null; },
      }).then((stop) => { previewStopRef.current = stop; }).catch(() => undefined);
    }
  }

  function updatePrivateComposition<K extends keyof InstrumentComposition>(key: K, index: number, value: InstrumentComposition[K][number]) {
    if (previewStopRef.current) stopArrangementPreview();
    setPrivateComposition((previous) => ({
      ...previous,
      [key]: previous[key].map((old, cell) => cell === index ? value : old),
    }));
  }

  function updateSlot(update: (slot: SoundSlot) => SoundSlot) {
    if (!currentSlot) return;
    if (previewStopRef.current) stopArrangementPreview();
    setItems((previous) => previous.map((item) => item.id !== selected ? item : {
      ...item,
      soundSlots: item.soundSlots.map((slot) => slot.id === currentSlot.id ? update(slot) : slot),
    }));
    setMessage("");
  }

  function updateSlotCell(index: number) {
    const next = ((currentSlot?.pattern[index] ?? 0) + 1) % 3;
    updateSlot((slot) => ({ ...slot, pattern: slot.pattern.map((value, cell) => cell === index ? next : value) }));
    // Célula da percussão é também um pad de pré-escuta: tocar imediatamente o som escolhido.
    if (next > 0) void previewCurrentSound(next as 1 | 2);
  }

  function updateComposition<K extends keyof InstrumentComposition>(key: K, index: number, value: InstrumentComposition[K][number]) {
    if (previewStopRef.current) stopArrangementPreview();
    setItems((previous) => previous.map((item) => item.id !== selected ? item : {
      ...item,
      composition: { ...item.composition, [key]: item.composition[key].map((old, cell) => cell === index ? value : old) },
    }));
  }

  function addSlot() {
    if (!current || current.soundSlots.length >= 10) return;
    const used = new Set(current.soundSlots.map((slot) => slot.id));
    let index = 1;
    while (used.has(`sound-${index}`)) index++;
    const instrument = INSTRUMENTS.find((item) => item.id === selected)!;
    const fresh = createDefaultSoundSlot(instrument, index - 1);
    fresh.pattern = Array(16).fill(0);
    fresh.name = `Som ${index}`;
    setItems((previous) => previous.map((item) => item.id === selected ? { ...item, soundSlots: [...item.soundSlots, fresh] } : item));
    setSelectedSlotId(fresh.id);
    setMessage("Novo tipo de som criado. Nomeie, escolha o timbre e salve.");
  }

  async function removeSlot() {
    if (!current || !currentSlot) return;
    const key = `${selected}:${currentSlot.id}`;
    samplePreviewCacheRef.current.delete(key);
    if (sampleNames[key]) {
      await fetch(`/api/music/${selected}/sounds/${currentSlot.id}/sample`, { method: "DELETE" });
      samplePreviewCacheRef.current.delete(key);
      setSampleNames((previous) => { const next = { ...previous }; delete next[key]; return next; });
    }
    const remaining = current.soundSlots.filter((slot) => slot.id !== currentSlot.id);
    setItems((previous) => previous.map((item) => item.id === selected ? { ...item, soundSlots: remaining } : item));
    setSelectedSlotId(remaining[0]?.id ?? "");
    setMessage("Tipo de som removido do editor. Salve para aplicar no simulador público.");
  }

  function resetSlot() {
    if (!current || !currentSlot) return;
    const instrument = INSTRUMENTS.find((item) => item.id === selected)!;
    const original = createDefaultSoundSlot(instrument, 0);
    updateSlot((slot) => ({ ...original, id: slot.id, name: slot.name }));
    setMessage("Timbre e células originais restaurados neste tipo de som. Salve para publicar.");
  }

  async function savePublic() {
    if (!current) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/music", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: current.id, soundSlots: current.soundSlots, composition: current.composition }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar o arranjo.");
      // Confirma a leitura pública após o PATCH; assim evitamos sinalizar sucesso com dados só no estado local.
      const verify = await fetch("/api/music", { cache: "no-store" });
      if (!verify.ok) throw new Error("O arranjo foi enviado, mas não consegui confirmar a leitura pública.");
      const verified = await verify.json() as ApiResponse;
      const published = verified.instruments?.[current.id];
      const instrumentDefinition = INSTRUMENTS.find((item) => item.id === current.id)!;
      const storedSlots = normalizeSoundSlots(published?.soundSlots, instrumentDefinition);
      const expectedSlots = normalizeSoundSlots(current.soundSlots, instrumentDefinition);
      const storedComposition = normalizeComposition(published?.composition);
      const expectedComposition = normalizeComposition(current.composition);
      if (!published || JSON.stringify(storedSlots) !== JSON.stringify(expectedSlots) || JSON.stringify(storedComposition) !== JSON.stringify(expectedComposition)) {
        throw new Error("O banco recebeu o envio, mas a leitura de conferência não corresponde ao arranjo. Atualize o estúdio e tente novamente.");
      }
      const revision = `${Date.now()}:${current.id}`;
      window.dispatchEvent(new CustomEvent("bsp:music-public-updated", { detail: { voice: current.id, revision } }));
      try { window.localStorage.setItem("bsp:music-public-updated", revision); } catch { /* armazenamento local pode estar bloqueado */ }
      try { const channel = new BroadcastChannel("bsp-music-public"); channel.postMessage({ voice: current.id, revision }); channel.close(); } catch { /* navegadores sem BroadcastChannel */ }
      setMessage(`Publicado e confirmado: ${current.name} agora está disponível em Sons & Inspirações (${data.soundCount} tipo(s) de som).`);
      setError(false);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Erro ao salvar."); setError(true); }
    finally { setSaving(false); }
  }

  async function previewCurrentSound(velocity: 1 | 2 = 1) {
    if (!currentSlot) return;
    const key = `${selected}:${currentSlot.id}`;
    const context = new AudioContext();
    try {
      if (context.state === "suspended") await context.resume();
      const at = context.currentTime + 0.015;
      if (currentSlot.source === "sample" && sampleNames[key]) {
        let pending = samplePreviewCacheRef.current.get(key);
        if (!pending) {
          pending = (async () => {
            try {
              const response = await fetch(`/api/music/${selected}/sounds/${currentSlot.id}/sample`, { cache: "no-store" });
              if (!response.ok) return null;
              return await context.decodeAudioData(await response.arrayBuffer());
            } catch { return null; }
          })();
          samplePreviewCacheRef.current.set(key, pending);
        }
        const buffer = await pending;
        if (!buffer) throw new Error("Não foi possível decodificar a gravação. Tente WAV ou MP3.");
        const source = context.createBufferSource();
        const gain = context.createGain();
        source.buffer = buffer;
        source.playbackRate.setValueAtTime(Math.pow(2, currentSlot.samplePlayback.pitchSemitones / 12), at);
        gain.gain.setValueAtTime(velocity === 2 ? 0.95 : 0.68, at);
        source.connect(gain); gain.connect(context.destination);
        source.start(at);
        if (currentSlot.samplePlayback.durationSeconds > 0) source.stop(at + currentSlot.samplePlayback.durationSeconds);
        const closeAfter = currentSlot.samplePlayback.durationSeconds > 0 ? currentSlot.samplePlayback.durationSeconds : buffer.duration / Math.pow(2, currentSlot.samplePlayback.pitchSemitones / 12);
        window.setTimeout(() => { void context.close().catch(() => {}); }, Math.min(9000, (closeAfter + 0.25) * 1000));
        return;
      }

      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      oscillator.type = currentSlot.synth.waveform;
      oscillator.frequency.setValueAtTime(currentSlot.synth.pitch, at);
      if (["surdo", "dobra", "martelo", "repinique", "timbal"].includes(selected)) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, currentSlot.synth.pitch * 0.55), at + Math.min(0.25, currentSlot.synth.decay * 0.7));
      filter.type = "lowpass"; filter.frequency.value = currentSlot.synth.filterHz;
      gain.gain.setValueAtTime(0.0001, at); gain.gain.exponentialRampToValueAtTime((velocity === 2 ? 0.52 : 0.36), at + 0.006); gain.gain.exponentialRampToValueAtTime(0.0001, at + currentSlot.synth.decay);
      oscillator.connect(filter); filter.connect(gain); gain.connect(context.destination);
      oscillator.start(at); oscillator.stop(at + currentSlot.synth.decay + 0.04);
      if (currentSlot.synth.noise > 0) {
        const buffer = context.createBuffer(1, context.sampleRate * 0.25, context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
        const source = context.createBufferSource(); const noiseGain = context.createGain();
        source.buffer = buffer; noiseGain.gain.setValueAtTime(currentSlot.synth.noise / 100 * (velocity === 2 ? 0.26 : 0.17), at); noiseGain.gain.exponentialRampToValueAtTime(0.0001, at + Math.min(0.22, currentSlot.synth.decay));
        source.connect(noiseGain); noiseGain.connect(context.destination); source.start(at); source.stop(at + Math.min(0.24, currentSlot.synth.decay + 0.02));
      }
      window.setTimeout(() => { void context.close().catch(() => {}); }, (currentSlot.synth.decay + 0.35) * 1000);
    } catch (err) {
      void context.close().catch(() => {});
      setMessage(err instanceof Error ? err.message : "Não foi possível pré-escutar este som.");
      setError(true);
    }
  }


  async function uploadSample(file?: File) {
    if (!file || !currentSlot) return;
    if (file.size > 5 * 1024 * 1024) { setMessage("O arquivo ultrapassa 5 MB. Use uma gravação curta e isolada."); setError(true); return; }
    const form = new FormData(); form.set("file", file);
    setUploading(true); setMessage("");
    try {
      const response = await fetch(`/api/music/${selected}/sounds/${currentSlot.id}/sample`, { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar o áudio.");
      setSampleNames((previous) => ({ ...previous, [`${selected}:${currentSlot.id}`]: file.name }));
      samplePreviewCacheRef.current.delete(`${selected}:${currentSlot.id}`);
      updateSlot((slot) => ({ ...slot, source: "sample" }));
      setMessage(`Gravação “${file.name}” associada a ${currentSlot.name}. Salve a configuração para publicar.`);
      setError(false);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Erro ao enviar áudio."); setError(true); }
    finally { setUploading(false); }
  }

  async function removeSample() {
    if (!currentSlot) return;
    setUploading(true); setMessage("");
    try {
      const response = await fetch(`/api/music/${selected}/sounds/${currentSlot.id}/sample`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível remover a gravação.");
      setSampleNames((previous) => { const next = { ...previous }; delete next[`${selected}:${currentSlot.id}`]; return next; });
      samplePreviewCacheRef.current.delete(`${selected}:${currentSlot.id}`);
      updateSlot((slot) => ({ ...slot, source: "synth" }));
      setMessage("Gravação removida. Este tipo de som voltou à síntese eletrônica.");
      setError(false);
    } catch (err) { setMessage(err instanceof Error ? err.message : "Erro ao remover áudio."); setError(true); }
    finally { setUploading(false); }
  }

  function copyPublicToPrivate() {
    const source = items.find((item) => item.id === privateVoice);
    const pattern = source?.soundSlots[0]?.pattern ?? INSTRUMENTS.find((item) => item.id === privateVoice)?.pattern ?? Array(16).fill(0);
    setPrivatePattern([...pattern]);
    setPrivateComposition(normalizeComposition(source?.composition ?? EMPTY_COMPOSITION));
    setMessage(`Batida e melodia públicas de ${source?.name ?? privateVoice} copiadas para o rascunho privado. Você pode alterá-las sem afetar o site.`);
  }

  async function sendPrivate() {
    const recipients = recipientIds.split(/[\n,;]+/).map((value) => value.trim()).filter(Boolean);
    setSending(true); setMessage("");
    try {
      const response = await fetch("/api/music/assignments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: privateTitle, instrument: privateVoice, recipientMemberIds: recipients,
          description: privateDescription, bpm: privateBpm, pattern: privatePattern,
          composition: privateComposition,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar o estudo.");
      setMessage(`Estudo enviado para ${data.created} integrante(s). Ele não aparece no simulador público.`);
      setRecipientIds(""); setError(false); await refreshAssignments();
    } catch (err) { setMessage(err instanceof Error ? err.message : "Erro ao enviar o estudo."); setError(true); }
    finally { setSending(false); }
  }

  async function deleteAssignment(id: number) {
    const response = await fetch(`/api/music/assignments/${id}`, { method: "DELETE" });
    if (response.ok) setAssignments((previous) => previous.filter((assignment) => assignment.id !== id));
    else { setMessage("Não foi possível excluir este envio."); setError(true); }
  }

  if (!current) return null;
  const hasSample = Boolean(currentSlot && sampleNames[`${selected}:${currentSlot.id}`]);

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-tinta/10 sm:p-8" aria-labelledby="music-admin-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="chip bg-sol-100 text-sol-600">Área restrita · administrador</span>
          <h2 id="music-admin-title" className="font-display mt-3 text-3xl text-lago sm:text-4xl">Estúdio musical BSP</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-tinta/70">Crie timbres, batidas, melodias e exercícios. O que é publicado fica no simulador; os estudos individuais são entregues apenas aos integrantes selecionados.</p>
        </div>
        <button type="button" onClick={() => void refresh()} className="btn btn-creme" disabled={loading}>↻ Atualizar</button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-tinta/10 pb-4">
        <button type="button" onClick={() => setTab("public")} className={`rounded-full px-5 py-3 text-sm font-bold ${tab === "public" ? "bg-lago text-creme" : "bg-areia text-tinta"}`}>Instrumentos públicos</button>
        <button type="button" onClick={() => setTab("private")} className={`rounded-full px-5 py-3 text-sm font-bold ${tab === "private" ? "bg-lago text-creme" : "bg-areia text-tinta"}`}>Enviar estudo privado</button>
      </div>

      {message && <p role={error ? "alert" : "status"} className={`mt-5 rounded-2xl p-3 text-sm font-semibold ${error ? "bg-sol-100 text-sol-700" : "bg-lago-100 text-lago-700"}`}>{message}</p>}

      {tab === "public" ? (
        <div className="mt-7 space-y-8">
          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <label htmlFor="music-instrument" className="field-label">1. Instrumento</label>
              <select id="music-instrument" className="input" value={selected} onChange={(event) => {
                const id = event.target.value as Voice; setSelected(id);
                const next = items.find((item) => item.id === id); setSelectedSlotId(next?.soundSlots[0]?.id ?? ""); setMessage("");
              }}>
                {items.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}
              </select>
              <div className="mt-4 rounded-2xl bg-areia p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-lago">Tipos de som</p><p className="mt-1 text-sm text-tinta/70">{current.soundSlots.length} de 10 atribuídos</p></div>
                  <button type="button" onClick={addSlot} disabled={current.soundSlots.length >= 10} className="btn btn-sol">＋ Novo som</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.soundSlots.map((slot) => <button key={slot.id} type="button" onClick={() => setSelectedSlotId(slot.id)} className={`rounded-full px-4 py-2 text-sm font-bold ${currentSlot?.id === slot.id ? "bg-lago text-creme" : "bg-white text-tinta ring-1 ring-tinta/10"}`}>{slot.name}</button>)}
                  {!current.soundSlots.length && <p className="text-sm text-tinta/60">Nenhum som criado. Use “Novo som” para começar.</p>}
                </div>
              </div>
              {currentSlot && <div className="mt-4 space-y-3 rounded-2xl border border-tinta/10 p-4">
                <label className="field-label" htmlFor="sound-name">Nome deste som</label>
                <input id="sound-name" className="input" value={currentSlot.name} maxLength={36} onChange={(event) => updateSlot((slot) => ({ ...slot, name: event.target.value }))} placeholder="Ex.: Slap, Open, Tapa" />
                <label className="field-label" htmlFor="sound-source">Fonte do som</label>
                <select id="sound-source" className="input" value={currentSlot.source} onChange={(event) => updateSlot((slot) => ({ ...slot, source: event.target.value as "synth" | "sample" }))}>
                  <option value="synth">Sintético · timbre configurável</option><option value="sample">Gravação real · arquivo enviado</option>
                </select>
                {currentSlot.source === "sample" ? <div className="rounded-xl bg-areia p-3">
                  <p className="text-sm font-semibold text-tinta">{hasSample ? sampleNames[`${selected}:${currentSlot.id}`] : "Ainda não há gravação neste tipo de som."}</p>
                  {hasSample && <audio key={`${selected}-${currentSlot.id}-${sampleNames[`${selected}:${currentSlot.id}`]}`} controls preload="none" className="mt-2 w-full" src={`/api/music/${selected}/sounds/${currentSlot.id}/sample`} />}
                  {hasSample && <div className="mt-4 grid gap-4 rounded-xl bg-white p-3 sm:grid-cols-2">
                    <label className="text-xs font-bold text-tinta/75">Pitch · {currentSlot.samplePlayback.pitchSemitones > 0 ? "+" : ""}{currentSlot.samplePlayback.pitchSemitones} semitons
                      <input className="mt-2 w-full accent-[#28799F]" type="range" min="-24" max="24" step="1" value={currentSlot.samplePlayback.pitchSemitones} onChange={(event) => updateSlot((slot) => ({ ...slot, samplePlayback: { ...slot.samplePlayback, pitchSemitones: Number(event.target.value) } }))} />
                      <span className="mt-1 block font-normal text-tinta/50">−2 oitavas a +2 oitavas</span>
                      <span className="mt-1 block font-normal text-tinta/50">A alteração é feita pela velocidade de reprodução.</span>
                    </label>
                    <label className="text-xs font-bold text-tinta/75">Duração {currentSlot.samplePlayback.durationSeconds === 0 ? "· original" : `· ${currentSlot.samplePlayback.durationSeconds.toFixed(2)} s`}
                      <input className="mt-2 w-full accent-[#28799F]" type="range" min="0" max="4" step="0.05" value={currentSlot.samplePlayback.durationSeconds} onChange={(event) => updateSlot((slot) => ({ ...slot, samplePlayback: { ...slot.samplePlayback, durationSeconds: Number(event.target.value) } }))} />
                      <span className="mt-1 block font-normal text-tinta/50">0 = tocar a gravação até o fim</span>
                    </label>
                  </div>}
                  <input className="mt-3 block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-lago file:px-3 file:py-2 file:font-semibold file:text-creme" type="file" accept="audio/*,.wav,.mp3,.ogg,.webm,.m4a,.aac,.flac,.aiff" disabled={uploading} onChange={(event) => void uploadSample(event.target.files?.[0])} />
                  <p className="mt-2 text-xs text-tinta/60">WAV, MP3, OGG, WebM, M4A/AAC, FLAC ou AIFF · até 5 MB por tipo de som.</p>
                  {hasSample && <button type="button" onClick={() => void removeSample()} disabled={uploading} className="mt-2 text-sm font-bold text-sol-700 underline">Remover esta gravação</button>}
                </div> : <div className="rounded-xl bg-areia p-3">
                  <p className="text-sm font-semibold text-lago">Desenhe o timbre sintético</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold text-tinta/70">Forma de onda
                      <select className="input mt-1" value={currentSlot.synth.waveform} onChange={(event) => updateSlot((slot) => ({ ...slot, synth: { ...slot.synth, waveform: event.target.value as SynthWaveform } }))}>
                        <option value="sine">Senoidal · suave</option><option value="triangle">Triangular · arredondado</option><option value="sawtooth">Dente de serra · brilhante</option><option value="square">Quadrada · agressiva</option>
                      </select>
                    </label>
                    <label className="text-xs font-bold text-tinta/70">Afinação base · {currentSlot.synth.pitch} Hz
                      <input className="mt-3 w-full accent-[#28799F]" type="range" min="35" max="1800" step="5" value={currentSlot.synth.pitch} onChange={(event) => updateSlot((slot) => ({ ...slot, synth: { ...slot.synth, pitch: Number(event.target.value) } }))} />
                    </label>
                    <label className="text-xs font-bold text-tinta/70">Duração · {currentSlot.synth.decay.toFixed(2)} s
                      <input className="mt-3 w-full accent-[#28799F]" type="range" min="0.04" max="2" step="0.02" value={currentSlot.synth.decay} onChange={(event) => updateSlot((slot) => ({ ...slot, synth: { ...slot.synth, decay: Number(event.target.value) } }))} />
                    </label>
                    <label className="text-xs font-bold text-tinta/70">Filtro · {currentSlot.synth.filterHz} Hz
                      <input className="mt-3 w-full accent-[#28799F]" type="range" min="80" max="12000" step="20" value={currentSlot.synth.filterHz} onChange={(event) => updateSlot((slot) => ({ ...slot, synth: { ...slot.synth, filterHz: Number(event.target.value) } }))} />
                    </label>
                    <label className="text-xs font-bold text-tinta/70 sm:col-span-2">Ruído/ataque · {currentSlot.synth.noise}%
                      <input className="mt-3 w-full accent-[#28799F]" type="range" min="0" max="100" step="1" value={currentSlot.synth.noise} onChange={(event) => updateSlot((slot) => ({ ...slot, synth: { ...slot.synth, noise: Number(event.target.value) } }))} />
                    </label>
                  </div>
                </div>}
                <button type="button" onClick={() => void previewCurrentSound()} className="btn btn-creme">▶ Ouvir prévia deste timbre</button>
                <button type="button" onClick={() => void removeSlot()} className="text-xs font-bold text-sol-700 underline">Excluir este tipo de som</button>
              </div>}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-display text-2xl text-lago">2. Batida · 16 passos</h3><p className="text-sm text-tinta/65">Duas fileiras de oito células. Toque para alternar e ouvir o som.</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => void previewPublicArrangement()} className="btn btn-sol">{previewStep >= 0 ? "■ Parar prévia" : "▶ Pré-ouvir arranjo"}</button>
                  {currentSlot && <button type="button" onClick={() => {
                  const instrument = INSTRUMENTS.find((item) => item.id === selected)!;
                  updateSlot((slot) => ({ ...slot, pattern: slot.id === "sound-1" ? [...instrument.pattern] : Array(16).fill(0) }));
                }} className="text-sm font-semibold text-lago underline">Restaurar batida inicial</button>}
                </div>
              </div>
              {currentSlot ? <>
                <div className="mt-5 w-full min-w-0 rounded-2xl border border-lago/10 bg-areia/55 p-3 sm:p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-lago">Sequenciador · 4 tempos</span>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-tinta/60">16 semicolcheias</span>
                  </div>
                  <div className="music-step-grid w-full min-w-0" style={STEP_GRID_STYLE} role="group" aria-label="Sequenciador em duas fileiras horizontais de oito passos">
                    {currentSlot.pattern.map((value, index) => <button key={index} type="button" onClick={() => updateSlotCell(index)} aria-label={`Passo ${index + 1}: ${value === 0 ? "silêncio" : value === 1 ? "toque normal" : "acento"}`} aria-pressed={value !== 0} className={`step-pad ${value === 2 ? "step-pad-accent" : value === 1 ? "step-pad-on" : "step-pad-off"} ${previewStep === index ? "step-pad-playing" : ""} ${index % 4 === 0 ? "step-pad-beat" : ""}`}><span className="step-pad-count">{index + 1}</span><span className="step-pad-subdivision">{STEP_NAMES[index]}</span><span className="step-pad-state" aria-hidden="true" /></button>)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-tinta/65"><span>□ Silêncio</span><span className="text-lago">■ Toque normal</span><span className="text-sol-700">■ Acento</span><span className="text-tinta/45">Toque em uma célula para ouvir o timbre.</span></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-tinta/70"><span>□ Silêncio</span><span className="text-lago">■ Toque normal</span><span className="text-sol-700">■ Acento</span><span className="text-tinta/50">Clique para alternar</span></div>
              </> : <p className="mt-5 rounded-2xl bg-areia p-5 text-sm text-tinta/70">Adicione um tipo de som para começar a montar a batida.</p>}
            </div>
          </div>

          {(isString || isWind) && <CompositionEditor key={selected} instrument={selected} composition={current.composition} onChange={updateComposition} onPreview={() => void previewPublicArrangement()} previewing={previewStep >= 0} />}

          <div className="flex flex-wrap gap-3 border-t border-tinta/10 pt-6">
            <button type="button" onClick={() => void savePublic()} disabled={saving || loading} className="btn btn-sol">{saving ? "Salvando…" : "Salvar e publicar instrumento"}</button>
            <span className="self-center text-xs text-tinta/55">As alterações públicas aparecem para todos os visitantes.</span>
          </div>
        </div>
      ) : (
        <div className="mt-7 flex flex-col gap-8">
          <div className="space-y-4">
            <div><h3 className="font-display text-2xl text-lago">Montar estudo para integrantes</h3><p className="mt-1 text-sm text-tinta/65">Faça uma versão específica de um instrumento e envie apenas para alunos ou músicos escolhidos.</p></div>
            <label className="field-label" htmlFor="private-title">Nome do estudo</label>
            <input id="private-title" className="input" value={privateTitle} onChange={(event) => setPrivateTitle(event.target.value)} placeholder="Ex.: Surdo — levada 2" />
            <label className="field-label" htmlFor="private-instrument">Instrumento</label>
            <select id="private-instrument" className="input" value={privateVoice} onChange={(event) => {
              const voice = event.target.value as Voice;
              setPrivateVoice(voice);
              const chosen = items.find((item) => item.id === voice);
              setPrivatePattern([...(chosen?.soundSlots[0]?.pattern ?? INSTRUMENTS.find((item) => item.id === voice)?.pattern ?? Array(16).fill(0))]);
              setPrivateComposition(normalizeComposition(chosen?.composition ?? EMPTY_COMPOSITION));
            }}>{INSTRUMENTS.map((instrument) => <option key={instrument.id} value={instrument.id}>{instrument.name}</option>)}</select>
            <label className="field-label" htmlFor="private-recipients">IDs dos integrantes</label>
            <textarea id="private-recipients" className="input min-h-24" value={recipientIds} onChange={(event) => setRecipientIds(event.target.value)} placeholder="Um ID por linha ou separados por vírgula. Ex.: 2013-015" />
            <p className="-mt-2 text-xs text-tinta/55">Pode colocar vários IDs para enviar o mesmo estudo à banda inteira ou a uma turma.</p>
            <label className="field-label" htmlFor="private-description">Orientações para o aluno / músico</label>
            <textarea id="private-description" className="input min-h-24" value={privateDescription} onChange={(event) => setPrivateDescription(event.target.value)} placeholder="Explique a levada, andamento, dinâmica ou o que deve ser praticado." />
            <label className="field-label" htmlFor="private-bpm">Andamento · {privateBpm} BPM</label>
            <input id="private-bpm" type="range" min="40" max="220" value={privateBpm} onChange={(event) => setPrivateBpm(Number(event.target.value))} className="w-full accent-[#28799F]" />
            <div className="flex flex-wrap gap-3"><button type="button" onClick={copyPublicToPrivate} className="btn btn-creme">Copiar arranjo público deste instrumento</button><button type="button" onClick={() => setPrivatePattern(Array(16).fill(0))} className="btn btn-creme">Limpar células</button><button type="button" onClick={() => void previewPrivateArrangement()} className="btn btn-sol">{privatePreviewStep >= 0 ? "■ Parar prévia" : "▶ Pré-ouvir estudo"}</button></div>
            <div className="w-full min-w-0 rounded-2xl bg-white p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-bold text-lago">Batida privada · 16 passos</h4><p className="text-xs text-tinta/60">Duas fileiras de oito passos. Clique para alternar entre silêncio, toque e acento.</p></div><span className="rounded-full bg-areia px-3 py-1 text-xs font-bold text-lago">{privateBpm} BPM</span></div>
              <div className="rounded-2xl border border-lago/10 bg-areia/55 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-lago">Prévia do estudo · 4 tempos</span><button type="button" onClick={() => void previewPrivateArrangement()} className="rounded-full bg-lago px-3 py-1.5 text-[11px] font-bold text-white">{privatePreviewStep >= 0 ? "■ Parar" : "▶ Ouvir batida + melodia"}</button></div>
                <div className="music-step-grid w-full min-w-0" style={STEP_GRID_STYLE} role="group" aria-label="Batida privada em duas fileiras de oito passos">{privatePattern.map((value, index) => <button key={index} type="button" onClick={() => updatePrivateCell(index)} aria-label={`Passo ${index + 1}`} aria-pressed={value !== 0} className={`step-pad ${value === 2 ? "step-pad-accent" : value === 1 ? "step-pad-on" : "step-pad-off"} ${privatePreviewStep === index ? "step-pad-playing" : ""}`}><span className="step-pad-count">{index + 1}</span><span className="step-pad-subdivision">{STEP_NAMES[index]}</span><span className="step-pad-state" aria-hidden="true" /></button>)}</div>
                <p className="mt-3 text-[11px] text-tinta/55">A prévia completa combina a batida com a melodia, os acordes e a batida base da guitarra, quando existirem.</p>
              </div>
            </div>
            {(privateVoice === "baixo" || privateVoice === "guitarra" || privateVoice === "metais") && <CompositionEditor key={`private-${privateVoice}`} instrument={privateVoice} composition={privateComposition} onChange={updatePrivateComposition} onPreview={() => void previewPrivateArrangement()} previewing={privatePreviewStep >= 0} />}
            <button type="button" onClick={() => void sendPrivate()} disabled={sending} className="btn btn-sol">{sending ? "Enviando…" : "Enviar estudo privado"}</button>
          </div>
          <aside className="rounded-3xl bg-areia p-5">
            <h3 className="font-display text-2xl text-lago">Entregas recentes</h3>
            <p className="mt-1 text-sm text-tinta/65">Os estudos abaixo são privados e só aparecem para os IDs destinatários.</p>
            <div className="mt-4 space-y-3">
              {assignments.length ? assignments.map((assignment) => <div key={assignment.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-tinta">{assignment.title}</p><p className="text-xs text-tinta/60">{assignment.instrument} · {assignment.recipientMemberId}</p><p className="mt-1 text-xs text-tinta/45">{new Date(assignment.createdAt).toLocaleDateString("pt-BR")}</p></div><button type="button" onClick={() => void deleteAssignment(assignment.id)} className="text-xs font-bold text-sol-700 underline">Excluir</button></div>
              </div>) : <p className="rounded-2xl bg-white p-4 text-sm text-tinta/60">Nenhum estudo enviado por enquanto.</p>}
            </div>
          </aside>
        </div>
      )}
      {loading && <p className="mt-5 text-sm text-tinta/60">Carregando configurações e materiais…</p>}
      {uploading && <p className="mt-3 text-sm font-semibold text-lago">Processando gravação de áudio…</p>}
    </section>
  );
}

function CompositionEditor({ instrument, composition, onChange, onPreview, previewing }: { instrument: Voice; composition: InstrumentComposition; onChange: <K extends keyof InstrumentComposition>(key: K, index: number, value: InstrumentComposition[K][number]) => void; onPreview: () => void; previewing: boolean }) {
  const isGuitar = instrument === "guitarra";
  const isString = instrument === "guitarra" || instrument === "baixo";
  const [activeSection, setActiveSection] = useState<"staff" | "chords" | "guitarBase">(isString ? "chords" : "staff");
  const title = instrument === "metais" ? "Melodia dos sopros" : instrument === "baixo" ? "Melodia e harmonia do baixo" : "Melodia e harmonia da guitarra";
  return <section className="rounded-3xl bg-areia/70 p-5 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-display text-2xl text-lago">3. {title}</h3><p className="mt-1 max-w-2xl text-sm text-tinta/65">Use a pauta para posicionar notas com precisão. Em cordas, você também pode escrever acordes completos e montar a batida base da guitarra.</p></div><button type="button" onClick={onPreview} className="btn btn-sol">{previewing ? "■ Parar prévia" : "▶ Pré-ouvir ritmo + melodia"}</button></div>
    <div className="mt-5 flex flex-wrap gap-2 border-b border-tinta/10 pb-3">
      <button type="button" onClick={() => setActiveSection("staff")} className={`rounded-full px-4 py-2 text-sm font-bold ${activeSection === "staff" ? "bg-lago text-creme" : "bg-white text-tinta"}`}>♫ Pauta musical</button>
      {isString && <button type="button" onClick={() => setActiveSection("chords")} className={`rounded-full px-4 py-2 text-sm font-bold ${activeSection === "chords" ? "bg-lago text-creme" : "bg-white text-tinta"}`}>Acordes e harmonia</button>}
      {isGuitar && <button type="button" onClick={() => setActiveSection("guitarBase")} className={`rounded-full px-4 py-2 text-sm font-bold ${activeSection === "guitarBase" ? "bg-lago text-creme" : "bg-white text-tinta"}`}>Batida base</button>}
    </div>
    {activeSection === "staff" && <div className="mt-4"><MusicStaveEditor instrument={instrument} composition={composition} onChange={onChange} /></div>}
    {activeSection === "chords" && isString && <div className="mt-4 rounded-2xl bg-white p-4 sm:p-5">
      <h4 className="text-base font-bold text-lago">Progressão de acordes · 16 passos</h4>
      <p className="mt-1 text-sm text-tinta/65">Digite a cifra no passo em que o acorde começa. O acorde continua valendo até o próximo. A guitarra pode usar essa progressão na batida base.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Cmaj7", "Am9", "G7(b9,#11)", "F#m7b5", "Bdim7", "Daug", "Bb13", "C/E"].map((example) => <span key={example} className="rounded-full bg-areia px-2.5 py-1 text-xs font-bold text-lago">{example}</span>)}
      </div>
      <div className="chord-grid-16 mt-5">{composition.chords.map((chord, index) => {
        const valid = !chord.trim() || isValidChordSymbol(chord);
        return <label key={index} className="min-w-0 rounded-lg bg-areia p-1.5 text-center">
          <span className="mb-1 block text-[10px] font-bold text-tinta/55">{STEP_NAMES[index]}</span>
          <input aria-label={`Acorde no passo ${index + 1}`} className={`w-full min-w-0 rounded-md border bg-white px-2 py-2.5 text-center text-sm font-bold text-tinta outline-none ${valid ? "border-lago/25 focus:border-lago" : "border-sol ring-1 ring-sol"}`} maxLength={32} value={chord} onChange={(event) => onChange("chords", index, event.target.value.replaceAll(" ", ""))} placeholder="—" list={`chord-options-${instrument}`} />
          <span className={`mt-1 block min-h-3 text-[9px] ${valid ? "text-tinta/35" : "text-sol-700"}`}>{chord ? (valid ? "válido" : "revise") : String(index + 1)}</span>
        </label>;
      })}</div>
      <datalist id={`chord-options-${instrument}`}>{CHORD_EXAMPLES.map((chord) => <option key={chord} value={chord} />)}</datalist>
      <details className="mt-4 rounded-xl bg-areia p-3">
        <summary className="cursor-pointer text-sm font-bold text-lago">Ver guia de cifras aceitas</summary>
        <p className="mt-2 text-xs leading-relaxed text-tinta/70">Tríades maiores e menores; diminutos (dim, °, dim7), meio-diminutos (m7b5, ø), aumentados (aug, +), suspensos (sus2/sus4), power chords, 6, m6, 6/9, 7, maj7, m7, mMaj7, 9, 11, 13, add9/add11/add13, alterações b5, #5, b9, #9, #11, b13, acordes alt, omissões no3/no5 e inversões com baixo indicado por barra, como C/E.
          <br />A notação segue as convenções comuns de lead sheet: extensões 9, 11 e 13 incluem a sétima, e a cifra após a barra indica a nota do baixo.</p>
      </details>
    </div>}
    {activeSection === "guitarBase" && isGuitar && <div className="mt-4 rounded-2xl bg-white p-4 sm:p-5">
      <h4 className="text-base font-bold text-lago">Ritmo de acompanhamento da guitarra</h4>
      <p className="mt-1 text-sm text-tinta/65">Marque onde a guitarra deve atacar o acorde que estiver ativo. Cada célula alterna entre silêncio, batida e acento.</p>
      <div className="mt-5 rounded-2xl border border-lago/10 bg-areia/55 p-3 sm:p-4">
        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-lago">Acompanhamento · 4 tempos</div>
        <div className="music-step-grid w-full min-w-0" style={STEP_GRID_STYLE}>{composition.guitarBase.map((value, index) => <button key={index} type="button" onClick={() => onChange("guitarBase", index, ((value + 1) % 3) as 0 | 1 | 2)} aria-label={`Ataque de guitarra no passo ${index + 1}`} aria-pressed={value !== 0} className={`step-pad ${value === 2 ? "step-pad-accent" : value === 1 ? "step-pad-on" : "step-pad-off"}`}><span className="step-pad-count">{index + 1}</span><span className="step-pad-subdivision">{STEP_NAMES[index]}</span><span className="step-pad-state" aria-hidden="true" /></button>)}</div>
      </div>
      <p className="mt-3 text-xs text-tinta/55">A batida base usa o acorde inserido na aba “Acordes e harmonia”; se não houver acorde novo naquele passo, mantém o último.</p>
    </div>}
  </section>;
}
