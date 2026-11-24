"use client";

import { useState } from "react";
import { INSTRUMENT_OPTIONS } from "@/lib/site";

export function CopyButton({ text, label = "Copiar chave Pix" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-sol"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* ignore */
        }
        setDone(true);
        setTimeout(() => setDone(false), 2200);
      }}
    >
      {done ? "✓ Copiado!" : label}
    </button>
  );
}

function useSubmit(url: string) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("loading");
    setError("");
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Erro ao enviar.");
      setState("ok");
      form.reset();
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }
  return { state, error, submit };
}

function Status({ state, error, ok }: { state: string; error: string; ok: string }) {
  if (state === "ok")
    return <p className="rounded-2xl bg-lago-100 p-4 font-semibold text-lago-700" role="status">{ok}</p>;
  if (state === "error")
    return <p className="rounded-2xl bg-sol-100 p-4 font-semibold text-sol-600" role="alert">{error}</p>;
  return null;
}

export function OficinaForm() {
  const { state, error, submit } = useSubmit("/api/oficina");
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="field-label" htmlFor="of-name">Nome completo</label>
        <input id="of-name" name="name" required className="input" autoComplete="name" />
      </div>
      <div>
        <label className="field-label" htmlFor="of-email">E-mail</label>
        <input id="of-email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="field-label" htmlFor="of-wpp">WhatsApp</label>
        <input id="of-wpp" name="whatsapp" required className="input" placeholder="(61) 99999-9999" autoComplete="tel" />
      </div>
      <div>
        <label className="field-label" htmlFor="of-level">Seu nível</label>
        <select id="of-level" name="level" required className="input" defaultValue="">
          <option value="" disabled>Selecione</option>
          <option>Nunca toquei</option>
          <option>Já toquei um pouco</option>
          <option>Toco em outro bloco / banda</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="of-inst">Instrumento que quer aprender</label>
        <select id="of-inst" name="instrument" className="input" defaultValue="">
          <option value="">Ainda não sei</option>
          {INSTRUMENT_OPTIONS.filter((i) => !["Mestre de bateria", "Outro"].includes(i)).map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="of-msg">Algo que a gente deva saber? (opcional)</label>
        <textarea id="of-msg" name="message" className="input" />
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2">
        <button className="btn btn-sol self-start" disabled={state === "loading"}>
          {state === "loading" ? "Enviando…" : "Enviar pré-inscrição"}
        </button>
        <Status state={state} error={error} ok="Pré-inscrição recebida! A coordenação da oficina entra em contato pelo WhatsApp." />
      </div>
    </form>
  );
}

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const { state, error, submit } = useSubmit("/api/contact");
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="field-label" htmlFor="c-name">Seu nome</label>
        <input id="c-name" name="name" required className="input" autoComplete="name" />
      </div>
      <div>
        <label className="field-label" htmlFor="c-email">E-mail</label>
        <input id="c-email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="c-subject">Assunto</label>
        <select id="c-subject" name="subject" required className="input" defaultValue={defaultSubject}>
          <option value="" disabled>Selecione</option>
          <option>Contratar o bloco para evento</option>
          <option>Imprensa e parcerias</option>
          <option>Oficina BSP</option>
          <option>Quero fazer parte do bloco</option>
          <option>Enviar fotos / vídeos / histórias</option>
          <option>Outro assunto</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="field-label" htmlFor="c-msg">Mensagem</label>
        <textarea id="c-msg" name="message" required className="input" placeholder="Conte data, local e tipo de evento, se for o caso." />
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2">
        <button className="btn btn-sol self-start" disabled={state === "loading"}>
          {state === "loading" ? "Enviando…" : "Enviar mensagem"}
        </button>
        <Status state={state} error={error} ok="Mensagem enviada! Responderemos em breve." />
      </div>
    </form>
  );
}
