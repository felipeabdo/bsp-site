"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Spiral, SpiralBackdrop } from "@/components/art";
import { MemberImage } from "@/components/silhouettes";
import type { PublicMember } from "@/lib/members";
import { displayName, fullName } from "@/lib/member-utils";

const TABS = [
  { key: "fundador", label: "Fundadores", empty: "Os fundadores ainda vão aparecer por aqui." },
  { key: "atual", label: "Formação atual", empty: "Ninguém da formação atual se cadastrou ainda. Seja o primeiro!" },
  { key: "ex", label: "Já passaram pelo bloco", empty: "Quem já passou pelo bloco pode se cadastrar e contar sua história." },
] as const;

const TONES = ["bg-sol text-creme", "bg-lago text-creme", "bg-areia text-tinta"];

export default function MembersExplorer({ members }: { members: PublicMember[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("fundador");
  const [openId, setOpenId] = useState<string | null>(null);

  const groups = useMemo(
    () => ({
      fundador: members.filter((m) => m.category === "fundador"),
      atual: members.filter((m) => m.category === "atual"),
      ex: members.filter((m) => m.category === "ex"),
    }),
    [members],
  );
  const list = groups[tab];
  const current = list.find((m) => m.memberId === openId) ?? null;

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current) return;
      const i = list.findIndex((m) => m.memberId === current.memberId);
      setOpenId(list[(i + dir + list.length) % list.length].memberId);
    },
    [current, list],
  );

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [current, step]);

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-5 py-3 text-base font-semibold transition ${
              tab === t.key ? "bg-lago text-creme shadow-[0_5px_0_var(--color-lago-700)]" : "bg-white text-tinta ring-1 ring-tinta/10 hover:bg-sol-100"
            }`}
          >
            {t.label} <span className="ml-1 opacity-70">{groups[t.key].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="mt-10 rounded-[2rem] bg-areia p-10 text-center">
          <p className="text-lg font-medium">{TABS.find((t) => t.key === tab)?.empty}</p>
          <Link href="/cadastro" className="btn btn-sol mt-5">Cadastrar como integrante</Link>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {list.map((m, i) => (
            <li key={m.memberId}>
              <button
                onClick={() => setOpenId(m.memberId)}
                className="group block w-full text-left"
                aria-label={`Ver destaque de ${displayName(m)}`}
              >
                <div className={`relative aspect-[3/4] overflow-hidden rounded-[1.75rem] transition duration-300 group-hover:-translate-y-2 group-hover:rotate-[-1.5deg] ${TONES[i % 3]}`}>
                  <Spiral className="absolute -right-8 -top-8 h-36 w-36 opacity-25 transition duration-700 group-hover:rotate-90" stroke={8} />
                  <div className="absolute inset-x-0 bottom-0 flex h-[88%] items-end justify-center">
                    <MemberImage member={m} kind="body" className="h-full w-full" silClass={i % 3 === 2 ? "text-lago/70" : "text-creme/85"} />
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-creme px-3 py-1 text-xs font-bold text-tinta">{m.memberId}</span>
                  {m.isDemo && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-tinta/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-creme">Exemplo</span>
                  )}
                </div>
                <div className="mt-3 px-1">
                  <h3 className="font-display text-xl leading-tight sm:text-2xl">{displayName(m)}</h3>
                  <p className="text-sm font-semibold text-sol-600">{m.instrument ?? "Integrante"}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {current && <Spotlight key={current.memberId} m={current} onClose={() => setOpenId(null)} onStep={step} many={list.length > 1} />}
    </div>
  );
}

function Spotlight({ m, onClose, onStep, many }: { m: PublicMember; onClose: () => void; onStep: (d: 1 | -1) => void; many: boolean }) {
  const half = m.hasBody && m.bodyPhotoType === "half";
  const since = m.category === "ex" && m.leftYear ? `${m.joinYear} – ${m.leftYear}` : `desde ${m.joinYear}`;
  const label = (m.instrument ?? "Bloco Santo Pecado").toUpperCase();
  return (
    <div className="fixed inset-0 z-50 animate-fade overflow-y-auto bg-lago text-creme" role="dialog" aria-modal="true" aria-label={displayName(m)}>
      <SpiralBackdrop className="pointer-events-none absolute -left-40 top-1/4 h-[44rem] w-[50rem] text-creme/10" />
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
        <span className="font-display absolute -right-10 top-10 whitespace-nowrap text-[18vw] uppercase leading-none text-creme/[0.07]">{label}</span>
        <span className="font-display absolute -right-24 bottom-0 whitespace-nowrap text-[18vw] uppercase leading-none text-creme/[0.07]">{label}</span>
      </div>

      <div className="relative mx-auto flex min-h-full max-w-6xl flex-col px-5 py-5 sm:px-8">
        <div className="flex items-center justify-between">
          <span className="chip bg-creme text-lago-700">{m.memberId}</span>
          <button onClick={onClose} className="grid h-12 w-12 place-items-center rounded-full bg-creme text-lago transition hover:rotate-90" aria-label="Fechar">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="grid flex-1 items-center gap-8 py-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute left-1/2 top-[22%] aspect-square w-[118%] -translate-x-1/2 rounded-full bg-sol" />
            <div
              className={`relative animate-pop overflow-hidden rounded-t-[999px] rounded-b-[2rem] border-8 border-creme bg-areia text-lago shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ${
                half ? "aspect-[4/5]" : "aspect-[3/5] max-h-[72vh]"
              } mx-auto`}
            >
              <div className={`flex h-full w-full items-end justify-center ${m.hasBody ? "" : "px-6 pt-10"}`}>
                <MemberImage member={m} kind="body" className="h-full w-full" />
              </div>
            </div>
            <span className="absolute -right-3 top-24 rotate-6 animate-pop rounded-2xl bg-sol px-4 py-2 font-display text-lg uppercase text-creme shadow-xl [animation-delay:0.25s]">
              {m.instrument ?? "Integrante"}
            </span>
          </div>

          <div className="animate-rise [animation-delay:0.15s]">
            <p className="font-semibold uppercase tracking-widest text-sol">{labelCat(m.category)} · {since}</p>
            <h2 className="font-display mt-2 text-[clamp(2.6rem,7vw,5.5rem)] uppercase">{displayName(m)}</h2>
            {fullName(m) !== displayName(m) && <p className="mt-1 text-lg font-medium text-creme/80">{fullName(m)}</p>}
            {!m.hasBody && (
              <p className="mt-3 inline-block rounded-2xl bg-creme/15 px-4 py-2 text-sm">A foto de corpo inteiro ainda não foi enviada — a silhueta guarda o lugar.</p>
            )}
            <div className="mt-6 space-y-3 text-lg leading-relaxed text-creme/95">
              {(m.bio ?? "Esse integrante ainda não contou sua história. Em breve ela aparece aqui.").split("\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {m.instagram && (
                <a className="btn btn-sol" href={`https://instagram.com/${m.instagram}`} target="_blank" rel="noreferrer">Instagram @{m.instagram}</a>
              )}
              {m.whatsapp && (
                <a className="btn btn-creme" href={`https://wa.me/${m.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
              )}
              <Link className="btn btn-ghost" href={`/verificar/${m.memberId}`}>Ver carteirinha pública</Link>
            </div>
          </div>
        </div>

        {many && (
          <div className="flex items-center justify-between pb-2">
            <button onClick={() => onStep(-1)} className="btn btn-ghost !px-5 !py-3">← Anterior</button>
            <button onClick={() => onStep(1)} className="btn btn-ghost !px-5 !py-3">Próximo →</button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelCat = (c: string) => (c === "fundador" ? "Fundador" : c === "ex" ? "Já passou pelo bloco" : "Formação atual");
