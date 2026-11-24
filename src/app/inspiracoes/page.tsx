import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Sampler from "@/components/Sampler";
import { Spiral } from "@/components/art";
import { INSPIRATIONS } from "@/lib/music";

export const metadata: Metadata = { title: "Sons & Inspirações" };

export default function InspiracoesPage() {
  return (
    <>
      <PageHero
        tone="lago"
        eyebrow="O som do bloco"
        title="Inspirações"
        accent="& instrumentos"
        subtitle="Quem veio antes de nós, quais tambores fazem o Santo Pecado soar como soa e o que cada instrumento faz no samba-reggae — com amostra para ouvir."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#instrumentos" className="btn btn-sol">Ouvir instrumentos</a>
          <a href="#inspiracoes" className="btn btn-creme">Nossas inspirações</a>
        </div>
      </PageHero>

      <section id="inspiracoes" className="section-pad scroll-mt-24 py-20 sm:py-28">
        <div className="container-bsp">
          <span className="chip bg-sol-100 text-sol-600">De onde vem a batida</span>
          <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Nossas inspirações</h2>
          <p className="mt-4 max-w-3xl text-lg text-tinta/80">
            O samba-reggae nasceu em Salvador e atravessou o Brasil. O Santo Pecado bebe dele, do axé e de artistas que
            moldaram a música popular — e os transforma no som de Brasília.
          </p>

          <ol className="mt-12 grid gap-6 md:grid-cols-2">
            {INSPIRATIONS.map((x, i) => (
              <li
                key={x.name}
                className={`relative overflow-hidden rounded-[2.25rem] p-7 sm:p-9 ${
                  i % 3 === 0 ? "bg-sol text-creme" : i % 3 === 1 ? "bg-lago text-creme" : "bg-areia text-tinta"
                } ${i === 0 ? "md:col-span-2" : ""}`}
              >
                <Spiral className="absolute -right-12 -top-12 h-48 w-48 opacity-20" stroke={8} />
                <div className="relative flex flex-wrap items-center gap-3">
                  <span className="font-display text-5xl opacity-90">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`chip ${i % 3 === 2 ? "bg-sol text-creme" : "bg-creme text-tinta"}`}>{x.tag}</span>
                </div>
                <h3 className="font-display relative mt-3 text-4xl sm:text-5xl">{x.name}</h3>
                <p className="relative mt-1 text-sm font-semibold uppercase tracking-wider opacity-80">
                  {x.place} · {x.year}
                </p>
                <p className="relative mt-4 leading-relaxed opacity-95">{x.story}</p>
                <p className={`relative mt-5 rounded-2xl p-4 text-sm font-semibold ${i % 3 === 2 ? "bg-white" : "bg-tinta/20"}`}>
                  O que levamos: <span className="font-medium">{x.gives}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="instrumentos" className="section-pad scroll-mt-24 bg-areia/70 py-20 sm:py-28">
        <div className="container-bsp">
          <span className="chip bg-lago text-creme">Bateria & banda</span>
          <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Os instrumentos do bloco</h2>
          <p className="mt-4 max-w-3xl text-lg text-tinta/80">
            O Santo Pecado é uma big band percussiva: tambores graves, agudos, esteira, chocalhos, cordas, metais e voz.
            Cada um tem uma função na conversa do samba-reggae.
          </p>
          <div className="mt-10">
            <Sampler />
          </div>
        </div>
      </section>
    </>
  );
}
