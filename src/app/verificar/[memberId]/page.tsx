import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IDCardFront } from "@/components/IDCard";
import { getMember } from "@/lib/members";
import { displayName } from "@/lib/member-utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Verificar carteirinha" };

export default async function VerificarPage({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  const m = await getMember(decodeURIComponent(memberId));
  if (!m) notFound();
  return (
    <section className="section-pad py-16 sm:py-24">
      <div className="container-bsp mx-auto max-w-2xl text-center">
        <span className="chip bg-lago text-creme">Verificação pública</span>
        <h1 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Integrante reconhecido</h1>
        <p className="mt-3 text-lg text-tinta/80">
          O ID <strong>{m.memberId}</strong> pertence a {displayName(m)}, integrante do Bloco Santo Pecado.
        </p>
        <div className="mx-auto mt-10 max-w-md">
          <IDCardFront m={m} />
        </div>
        <p className="mt-6 text-sm text-tinta/60">Por segurança, esta página exibe apenas dados públicos.</p>
        <Link href="/integrantes" className="btn btn-sol mt-8">Ver todos os integrantes</Link>
      </div>
    </section>
  );
}
