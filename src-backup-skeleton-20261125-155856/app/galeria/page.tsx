import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import GalleryClient from "@/components/GalleryClient";
import { EventList, MiniCalendar, PastEventList } from "@/components/Calendar";
import Img from "@/components/Img";
import { GALLERY_FALLBACK_NOTE, SITE } from "@/lib/site";
import { VIDEOS } from "@/lib/gallery";
import { pastEvents, publishedUpcomingEvents } from "@/lib/members";

export const metadata: Metadata = { title: "Galeria · Fotos, vídeos e agenda" };
export const dynamic = "force-dynamic";

export default async function GaleriaPage() {
  const [next, past] = await Promise.all([publishedUpcomingEvents(10), pastEvents(8)]);
  return (
    <>
      <PageHero
        tone="sol"
        eyebrow="Fotos, vídeos e agenda"
        title="O bloco"
        accent="na rua"
        subtitle="Registros dos eventos em que o Santo Pecado já tocou e os próximos compromissos do calendário."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#fotos" className="btn btn-lago">Fotos</a>
          <a href="#videos" className="btn btn-creme">Vídeos</a>
          <a href="#agenda" className="btn btn-creme">Agenda</a>
        </div>
      </PageHero>

      <section id="fotos" className="section-pad scroll-mt-24 py-16 sm:py-24">
        <div className="container-bsp">
          <h2 className="font-display text-5xl text-lago sm:text-6xl">Fotos dos eventos</h2>
          <p className="mt-3 text-tinta/70">{GALLERY_FALLBACK_NOTE}</p>
          <div className="mt-8">
            <GalleryClient />
          </div>
        </div>
      </section>

      <section id="videos" className="section-pad scroll-mt-24 bg-lago py-16 text-creme sm:py-24">
        <div className="container-bsp">
          <span className="chip bg-sol text-creme">Em movimento</span>
          <h2 className="font-display mt-4 text-5xl sm:text-6xl">Vídeos</h2>
          <p className="mt-3 max-w-2xl text-creme/85">
            Os vídeos oficiais ficam nas redes do bloco. Acompanhe o Instagram para ver cortejos, ensaios e a turnê.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {VIDEOS.map((v) => (
              <a key={v.title} href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-[2rem] bg-creme text-tinta">
                <div className="relative aspect-video overflow-hidden">
                  <Img src={v.poster} alt={v.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 grid place-items-center bg-tinta/30">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-sol pl-1 text-2xl text-creme shadow-xl transition group-hover:scale-110 animate-pulse-ring">▶</span>
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl text-lago">{v.title}</h3>
                  <p className="mt-1 text-sm text-tinta/75">{v.description}</p>
                  <p className="mt-3 text-sm font-bold text-sol-600">Assistir no Instagram →</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="agenda" className="section-pad scroll-mt-24 py-16 sm:py-24">
        <div className="container-bsp grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="chip bg-sol-100 text-sol-600">Calendário</span>
            <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Próximos eventos</h2>
            <div className="mt-8"><MiniCalendar events={next} /></div>
            <h3 className="font-display mt-10 text-3xl text-lago">Já passou por aqui</h3>
            <div className="mt-3"><PastEventList events={past} /></div>
          </div>
          <div>
            <EventList events={next} />
            <p className="mt-6 text-sm text-tinta/60">A agenda reúne somente compromissos confirmados e publicados pela equipe do bloco.</p>
          </div>
        </div>
      </section>
    </>
  );
}
