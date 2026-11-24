import type { Metadata } from "next";
import Link from "next/link";
import MembersExplorer from "@/components/MembersExplorer";
import PageHero from "@/components/PageHero";
import { listMembers } from "@/lib/members";

export const metadata: Metadata = { title: "Integrantes" };
export const dynamic = "force-dynamic";

export default async function IntegrantesPage() {
  const members = await listMembers();
  return (
    <>
      <PageHero
        tone="sol"
        eyebrow="Quem faz o som"
        title="Gente de"
        accent="tambor"
        subtitle="Fundadores, formação atual e quem já passou pelo bloco. Toque em um rosto para ver o músico em destaque, sua história e seus contatos."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/cadastro" className="btn btn-lago">Sou integrante · cadastrar</Link>
          <Link href="/entrar" className="btn btn-creme">Entrar</Link>
        </div>
      </PageHero>
      <section className="section-pad py-14 sm:py-20">
        <div className="container-bsp">
          <MembersExplorer members={members} />
          <p className="mt-12 rounded-3xl bg-areia p-6 text-sm text-tinta/75">
            Cada integrante tem um ID no formato <strong>ano-ordem</strong> (ex.: 2013-001). Quem ainda não enviou foto
            aparece com uma silhueta; os perfis marcados como “Exemplo” servem só para demonstrar o layout.
          </p>
        </div>
      </section>
    </>
  );
}
