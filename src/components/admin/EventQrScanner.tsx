"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type EventOption = { id: number; title: string; startsAt: string; location: string | null };
type MemberDetails = {
  id: number;
  memberId: string;
  joinYear: number;
  firstName: string;
  lastName: string;
  stageName: string | null;
  category: string;
  instrument: string | null;
  email: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  gender: string | null;
  instagram: string | null;
  whatsapp: string | null;
  bloodType: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  shirtSize: string | null;
  bio: string | null;
  bodyPhotoType: string;
  hasPortrait: boolean;
  hasBody: boolean;
  photoVersion: number;
  showContact: boolean;
  createdAt: string;
};
type ScanResult = {
  ok: true;
  alreadyCheckedIn: boolean;
  scannedAt: string;
  event: { id: number; title: string };
  member: MemberDetails;
};
type DetectedCode = { rawValue: string };
type QrDetector = { detect(source: HTMLVideoElement): Promise<DetectedCode[]> };
type QrDetectorConstructor = new (options: { formats: string[] }) => QrDetector;

const value = (input: string | null | undefined) => input?.trim() || "Não informado";
const fullName = (m: MemberDetails) => [m.firstName, m.lastName].filter(Boolean).join(" ");
const dateTime = (input: string) => new Date(input).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

function Detail({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-bold uppercase tracking-wider text-tinta/55">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-tinta">{children}</dd>
    </div>
  );
}

export default function EventQrScanner({ initialEvents }: { initialEvents: EventOption[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [eventId, setEventId] = useState(initialEvents[0] ? String(initialEvents[0].id) : "");
  const [qrValue, setQrValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<QrDetector | null>(null);
  const animationRef = useRef<number | null>(null);
  const scanningRef = useRef(false);

  useEffect(() => () => {
    scanningRef.current = false;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function stopCamera() {
    scanningRef.current = false;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }

  async function refreshEvents() {
    setLoadingEvents(true);
    try {
      const response = await fetch("/api/admin/check-in/events", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os eventos.");
      const items = (data.events ?? []) as EventOption[];
      setEvents(items);
      setEventId((current) => items.some((item) => String(item.id) === current) ? current : String(items[0]?.id ?? ""));
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Erro ao carregar eventos." });
    } finally {
      setLoadingEvents(false);
    }
  }

  async function submitScan(raw: string) {
    if (!eventId) {
      setNotice({ ok: false, text: "Cadastre ou selecione um evento antes de fazer a leitura." });
      return;
    }
    if (!raw.trim() || busy) return;
    stopCamera();
    setBusy(true);
    setNotice(null);
    setResult(null);
    try {
      const response = await fetch("/api/admin/check-in/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: Number(eventId), qrValue: raw.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível validar esta carteirinha.");
      setResult(data as ScanResult);
      setNotice({ ok: true, text: data.alreadyCheckedIn ? "Este integrante já teve a entrada registrada neste evento." : "Entrada registrada com sucesso!" });
      setQrValue("");
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Erro ao ler carteirinha." });
    } finally {
      setBusy(false);
    }
  }

  async function startCamera() {
    setNotice(null);
    if (!eventId) {
      setNotice({ ok: false, text: "Selecione um evento antes de abrir o leitor." });
      return;
    }
    const Detector = (window as typeof window & { BarcodeDetector?: QrDetectorConstructor }).BarcodeDetector;
    if (!Detector) {
      setNotice({ ok: false, text: "Este navegador não oferece leitura QR pela câmera. Use Chrome ou Edge atualizado, ou digite/cole o conteúdo do QR no campo abaixo." });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setNotice({ ok: false, text: "A câmera exige HTTPS e permissão do navegador. Abra o site pelo endereço seguro (https://)." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      detectorRef.current = new Detector({ formats: ["qr_code"] });
      const video = videoRef.current;
      if (!video) throw new Error("Não foi possível inicializar o vídeo da câmera.");
      video.srcObject = stream;
      await video.play();
      scanningRef.current = true;
      setCameraActive(true);

      const scanFrame = async () => {
        const video = videoRef.current;
        const detector = detectorRef.current;
        if (!scanningRef.current || !video || !detector) return;
        try {
          if (video.readyState >= 2) {
            const codes = await detector.detect(video);
            const first = codes.find((code) => code.rawValue);
            if (first) {
              scanningRef.current = false;
              await submitScan(first.rawValue);
              return;
            }
          }
        } catch {
          // Uma imagem momentaneamente ilegível não encerra a leitura.
        }
        if (scanningRef.current) animationRef.current = requestAnimationFrame(() => void scanFrame());
      };
      animationRef.current = requestAnimationFrame(() => void scanFrame());
    } catch (error) {
      stopCamera();
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Não foi possível acessar a câmera. Verifique as permissões." });
    }
  }

  const member = result?.member;
  const selectedEvent = events.find((item) => String(item.id) === eventId);

  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-lago p-5 text-creme shadow-lg sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-sol">Operação de eventos</p>
        <h2 className="mt-2 font-display text-3xl uppercase sm:text-4xl">Leitor de carteirinhas</h2>
        <p className="mt-2 max-w-2xl text-sm text-creme/80 sm:text-base">Selecione o evento e leia o QR da carteirinha. O sistema valida o integrante e registra a entrada uma única vez por evento.</p>
      </div>

      <section className="rounded-3xl border border-tinta/10 bg-white p-5 shadow-sm sm:p-7">
        <label className="field-label" htmlFor="checkin-event">Evento para registrar entrada</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select id="checkin-event" className="input min-w-0 flex-1" value={eventId} onChange={(event) => { setEventId(event.target.value); setResult(null); }} disabled={loadingEvents}>
            <option value="">Selecione um evento</option>
            {events.map((event) => <option key={event.id} value={event.id}>{event.title} · {dateTime(event.startsAt)}</option>)}
          </select>
          <button type="button" onClick={() => void refreshEvents()} disabled={loadingEvents} className="btn btn-ghost">{loadingEvents ? "Atualizando…" : "Atualizar eventos"}</button>
        </div>
        {selectedEvent && <p className="mt-2 text-sm text-tinta/60">{dateTime(selectedEvent.startsAt)}{selectedEvent.location ? ` · ${selectedEvent.location}` : ""}</p>}
        {events.length === 0 && <p className="mt-3 rounded-xl bg-sol/10 p-3 text-sm text-tinta">Não há eventos confirmados nesta janela. Cadastre/confirme um evento na agenda e atualize a lista.</p>}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="rounded-3xl border border-tinta/10 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-2xl text-lago">Leitura pela câmera</h3>
            {cameraActive && <span className="rounded-full bg-lago/10 px-3 py-1 text-xs font-bold text-lago">Câmera ativa</span>}
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl bg-[#132a31]">
            <video ref={videoRef} className={`${cameraActive ? "block" : "hidden"} aspect-video w-full object-cover`} playsInline muted />
            {!cameraActive && <div className="flex aspect-video flex-col items-center justify-center gap-3 px-5 text-center text-creme/75"><span className="text-5xl">▦</span><p className="text-sm">A câmera aparecerá aqui quando o leitor for iniciado.</p></div>}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {!cameraActive ? <button type="button" onClick={() => void startCamera()} disabled={!eventId || busy} className="btn btn-sol">Abrir câmera e ler QR</button> : <button type="button" onClick={stopCamera} className="btn btn-ghost">Desligar câmera</button>}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-tinta/55">A leitura ao vivo usa o detector QR nativo do navegador. Para liberar a câmera, o site precisa estar em HTTPS e você precisa autorizar o acesso.</p>
        </div>

        <div className="rounded-3xl border border-tinta/10 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="font-display text-2xl text-lago">Leitura manual</h3>
          <p className="mt-2 text-sm text-tinta/65">Também funciona com leitor USB/Bluetooth ou colando o endereço lido pelo celular.</p>
          <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); void submitScan(qrValue); }}>
            <label className="field-label" htmlFor="qr-value">Conteúdo do QR Code</label>
            <textarea id="qr-value" className="input min-h-28 resize-y" value={qrValue} onChange={(event) => setQrValue(event.target.value)} placeholder="https://seusite.com/q/123-…" />
            <button className="btn btn-sol w-full" disabled={!eventId || !qrValue.trim() || busy}>{busy ? "Validando…" : "Validar e registrar entrada"}</button>
          </form>
        </div>
      </section>

      {notice && <p role={notice.ok ? "status" : "alert"} className={`rounded-2xl p-4 font-semibold ${notice.ok ? "bg-lago/10 text-lago" : "bg-sol/15 text-[#8b3e20]"}`}>{notice.text}</p>}

      {member && result && (
        <section className="overflow-hidden rounded-3xl border border-lago/20 bg-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-lago px-5 py-4 text-creme sm:px-7">
            <div className="flex min-w-0 items-center gap-4">
              {member.hasPortrait && <img src={`/api/photo/${encodeURIComponent(member.memberId)}/portrait?v=${member.photoVersion}`} alt={`Foto de ${fullName(member)}`} className="h-16 w-16 shrink-0 rounded-xl border-2 border-creme/70 object-cover" />}
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-creme/65">{result.event.title}</p>
                <h3 className="mt-1 font-display text-2xl uppercase">{fullName(member)}</h3>
                {member.stageName && <p className="text-sm text-creme/80">Nome artístico: {member.stageName}</p>}
              </div>
            </div>
            <span className="rounded-full bg-creme px-4 py-2 font-display text-xl text-lago">{member.memberId}</span>
          </div>
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-lago/10 px-3 py-1 text-sm font-bold text-lago">{member.category === "ex" ? "Ex-integrante" : member.category === "fundador" ? "Fundador(a)" : "Integrante"}</span>
              {member.instrument && <span className="rounded-full bg-sol/15 px-3 py-1 text-sm font-bold text-[#98502f]">{member.instrument}</span>}
              <span className="text-xs text-tinta/50">Entrada: {dateTime(result.scannedAt)}</span>
            </div>

            <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail label="Nome completo">{fullName(member)}</Detail>
              <Detail label="Nome artístico">{value(member.stageName)}</Detail>
              <Detail label="E-mail">{value(member.email)}</Detail>
              <Detail label="Telefone">{value(member.phone)}</Detail>
              <Detail label="WhatsApp">{value(member.whatsapp)}</Detail>
              <Detail label="Instagram">{member.instagram ? `@${member.instagram.replace(/^@/, "")}` : "Não informado"}</Detail>
              <Detail label="Data de nascimento">{value(member.birthDate)}</Detail>
              <Detail label="Naturalidade">{value(member.birthPlace)}</Detail>
              <Detail label="Gênero">{value(member.gender)}</Detail>
              <Detail label="Endereço" wide>{value(member.address)}{member.address ? `, ${[member.city, member.state, member.zip].filter(Boolean).join(" · ")}` : ""}</Detail>
              <Detail label="Tipo sanguíneo"><span className="text-xl font-black text-sol">{value(member.bloodType)}</span></Detail>
              <Detail label="Tamanho da camiseta">{value(member.shirtSize)}</Detail>
              <Detail label="Contato de emergência">{value(member.emergencyName)}</Detail>
              <Detail label="Telefone de emergência">{value(member.emergencyPhone)}</Detail>
              <Detail label="Integrante desde">{member.joinYear}</Detail>
              <Detail label="Cadastro criado em">{dateTime(member.createdAt)}</Detail>
              <Detail label="Contato público">{member.showContact ? "WhatsApp autorizado no perfil público" : "Contato oculto no perfil público"}</Detail>
              <Detail label="Foto de corpo inteiro">{member.hasBody ? `Enviada (${member.bodyPhotoType === "half" ? "meio corpo" : "corpo inteiro"})` : "Não enviada"}</Detail>
              <Detail label="Foto 3×4">{member.hasPortrait ? "Enviada" : "Não enviada"}</Detail>
              <Detail label="Biografia / história" wide>{value(member.bio)}</Detail>
            </div>
            <p className="mt-6 border-t border-tinta/10 pt-4 text-xs text-tinta/50">Dados pessoais e de saúde exibidos somente para a administração autorizada. Não compartilhe esta tela fora da equipe responsável pelo evento.</p>
          </div>
        </section>
      )}
    </div>
  );
}
