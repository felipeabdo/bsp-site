"use client";

import { useMemo, useState } from "react";
import { MemberImage } from "@/components/silhouettes";
import { displayName } from "@/lib/member-utils";
import type { PublicMember } from "@/lib/members";

export default function MemberDirectory({ members }: { members: PublicMember[] }) {
  const [instrument, setInstrument] = useState("todos");
  const [year, setYear] = useState("todos");

  const instruments = useMemo(
    () => [...new Set(members.map((member) => member.instrument).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [members],
  );
  const years = useMemo(
    () => [...new Set(members.map((member) => member.joinYear))].sort((a, b) => b - a),
    [members],
  );
  const filtered = members.filter((member) =>
    (instrument === "todos" || member.instrument === instrument)
    && (year === "todos" || String(member.joinYear) === year),
  );

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-tinta/10 sm:p-8" aria-labelledby="member-directory-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-sol-600">Nossa comunidade</p>
          <h2 id="member-directory-title" className="font-display mt-2 text-3xl text-lago sm:text-4xl">Diretório de integrantes</h2>
          <p className="mt-2 text-sm text-tinta/65">Encontre a galera por naipe ou ano de entrada.</p>
        </div>
        <p className="font-display text-3xl text-sol">{filtered.length} <span className="font-sans text-sm font-extrabold text-tinta/55">integrantes</span></p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Filtrar por naipe</span>
          <select className="input" value={instrument} onChange={(event) => setInstrument(event.target.value)}>
            <option value="todos">Todos os naipes</option>
            {instruments.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Filtrar por ano de entrada</span>
          <select className="input" value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="todos">Todos os anos</option>
            {years.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      {filtered.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((member) => (
            <li key={member.memberId} className="min-w-0 rounded-2xl bg-areia/70 p-3">
              <div className="relative mx-auto aspect-[4/4.5] max-w-[11rem] overflow-hidden rounded-xl bg-lago-100 text-lago/60">
                <MemberImage member={member} kind="portrait" className="h-full w-full" />
              </div>
              <h3 className="mt-3 truncate font-extrabold text-lago" title={displayName(member)}>{displayName(member)}</h3>
              <p className="truncate text-xs font-bold text-sol-600">{member.instrument ?? "Naipe não informado"}</p>
              <p className="mt-1 text-[11px] font-semibold text-tinta/50">Desde {member.joinYear} · {member.memberId}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl bg-areia p-5 text-sm font-semibold text-tinta/65">Nenhum integrante corresponde a esses filtros.</p>
      )}
    </section>
  );
}
