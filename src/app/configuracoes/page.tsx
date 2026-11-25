import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { IDCardBack, IDCardFront } from "@/components/IDCard";
import { AccountPanel, PhotosManager, PrintButton, ProfileForm } from "@/components/SettingsClient";
import { LogoMark } from "@/components/art";
import { getCurrentUser } from "@/lib/auth";
import { isMusicAdmin } from "@/lib/music-admin";
import MusicStudioAdmin from "@/components/MusicStudioAdmin";
import PrivateAssignments from "@/components/PrivateAssignments";
import { displayName } from "@/lib/member-utils";
import { createMemberQrToken } from "@/lib/member-qr";
import { getSiteOrigin } from "@/lib/site-origin";

export const metadata: Metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

const TABS = [
  { key: "perfil", label: "Perfil" },
  { key: "fotos", label: "Fotos" },
  { key: "carteirinha", label: "Carteirinha" },
  { key: "conta", label: "Conta" },
  { key: "estudos", label: "Meus estudos" },
] as const;

export default async function ConfiguracoesPage({ searchParams }: { searchParams: Promise<{ aba?: string; novo?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  const sp = await searchParams;
  const admin = isMusicAdmin(user);
  const tabs = admin ? [...TABS, { key: "estudio", label: "Estúdio musical" }] : TABS;
  const aba = tabs.find((t) => t.key === sp.aba)?.key ?? "perfil";
  const cardQrValue = aba === "carteirinha"
    ? `${await getSiteOrigin()}/q/${createMemberQrToken(user.id, user.memberId)}`
    : "";

  return (
    <>
      <section className="relative overflow-hidden bg-lago text-creme">
        <LogoMark className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 text-creme/12" />
        <div className="container-bsp section-pad relative py-12 sm:py-16">
          <p className="font-semibold uppercase tracking-widest text-sol">Configurações</p>
          <h1 className="font-display mt-2 text-5xl uppercase sm:text-6xl">Olá, {displayName(user).split(" ")[0]}!</h1>
          <p className="mt-2 text-lg text-creme/85">
            Seu ID de integrante: <strong className="font-display text-2xl text-creme">{user.memberId}</strong>
          </p>
          {admin && <Link href="/eventos/leitor" className="mt-5 inline-flex rounded-full bg-creme px-5 py-2.5 font-bold text-lago shadow-sm transition hover:bg-sol hover:text-creme">Abrir leitor de eventos</Link>}
          {sp.novo && (
            <p className="mt-5 max-w-2xl rounded-2xl bg-sol p-4 font-semibold text-creme">
              Cadastro criado! Agora envie suas fotos (corpo inteiro e 3×4) para completar sua página e sua carteirinha.
            </p>
          )}
        </div>
      </section>

      <div className="section-pad sticky top-[68px] z-30 bg-creme/95 py-3 backdrop-blur">
        <nav className="container-bsp no-scrollbar flex gap-2 overflow-x-auto" aria-label="Seções das configurações">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/configuracoes?aba=${t.key}`}
              className={`shrink-0 rounded-full px-5 py-2.5 font-semibold transition ${aba === t.key ? "bg-sol text-creme shadow-[0_5px_0_var(--color-sol-600)]" : "bg-white ring-1 ring-tinta/10 hover:bg-sol-100"}`}
              aria-current={aba === t.key ? "page" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <section className="section-pad py-10 sm:py-14">
        <div className="container-bsp">
          {aba === "perfil" && <ProfileForm user={user} />}
          {aba === "estudio" && admin && <MusicStudioAdmin />}
          {aba === "estudos" && <PrivateAssignments />}
          {aba === "fotos" && <PhotosManager user={user} />}
          {aba === "conta" && <AccountPanel email={user.email} />}
          {aba === "carteirinha" && (
            <div>
              <h2 className="font-display text-4xl text-lago sm:text-5xl">Minha carteirinha</h2>
              <p className="mt-2 max-w-2xl text-tinta/75">
                Documento de identificação interna do bloco. O QR Code identifica sua carteirinha e permite registrar presença em eventos —
                {!user.hasPortrait && " envie sua foto na aba Fotos para completar."}
              </p>
              <div className="print-area mt-8 grid gap-6 lg:grid-cols-2">
                <div className="mx-auto w-full max-w-lg"><IDCardFront m={user} qrValue={cardQrValue} /></div>
                <div className="mx-auto w-full max-w-lg"><IDCardBack m={user} p={user} /></div>
              </div>
              <div className="no-print mt-8 flex flex-wrap items-center gap-3">
                <PrintButton />
                <Link href={`/verificar/${user.memberId}`} className="btn btn-creme">Ver verificação pública</Link>
                {!user.hasPortrait && <Link href="/configuracoes?aba=fotos" className="btn btn-lago">Enviar foto 3×4</Link>}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
