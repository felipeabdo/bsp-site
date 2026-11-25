import Link from "next/link";
import { preload } from "react-dom";
import { redirect } from "next/navigation";
import { LogoMark, Spiral, SpiralBackdrop } from "@/components/art";
import HomeHeroImage, { HERO_AVIF_SRCSET, HERO_SIZES } from "@/components/HomeHeroImage";
import ArtistsMarquee from "@/components/ArtistsMarquee";
import { SeeAll } from "@/components/Calendar";
import HomeCalendar from "@/components/HomeCalendar";
import { getCurrentUser } from "@/lib/auth";
import { publishedUpcomingEvents } from "@/lib/members";

export const dynamic = "force-dynamic";

function saoPauloToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default async function Home() {
  // Antecipa o preload antes da consulta de sessão. O navegador recebe
  // a mesma lista AVIF e os mesmos sizes usados pelo <picture>, escolhendo
  // a variante ideal sem baixar uma segunda resolução.
  preload("/brand/photos/home-hero-complete-480.avif", {
    as: "image",
    fetchPriority: "high",
    imageSrcSet: HERO_AVIF_SRCSET,
    imageSizes: HERO_SIZES,
    type: "image/avif",
  });

  const user = await getCurrentUser();
  if (user) redirect("/area-integrante");

  const today = saoPauloToday();
  const upcoming = await publishedUpcomingEvents(12);
  const calendarEvents = upcoming.map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.startsAt.toISOString(),
    timeLabel: event.timeLabel,
    location: event.location,
    description: event.description,
    kind: event.kind,
    free: event.free,
  }));

  return (
    <>
      {/* 01 · HERO: identidade do bloco e dois caminhos objetivos. */}
      <section className="home-hero relative isolate w-full overflow-hidden bg-lago text-creme">
        <SpiralBackdrop className="pointer-events-none absolute -right-[15%] top-[4%] z-0 aspect-[1.21] w-[min(66vw,58rem)] text-creme/10" />
        <Spiral className="pointer-events-none absolute -bottom-28 -left-24 z-0 h-80 w-80 text-sol/15" stroke={8} />

        <div className="home-hero__stage relative z-10">
          <div className="container-bsp section-pad home-hero__grid">
            <div className="home-hero__copy">
              <p className="mb-4 inline-flex rounded-full border border-creme/35 bg-creme/10 px-4 py-2 text-xs font-black uppercase tracking-[0.17em] text-sol sm:text-sm">
                Eu curto bloco de rua!
              </p>
              <h1 className="home-hero__title">
                Bloco <em>Santo</em>
                <br />
                Pecado
              </h1>
              <p className="home-hero__description">
                Uma big band percussiva que nasceu do encontro de amigos e hoje faz Brasília dançar com a força do samba-reggae, do axé e da música de rua.
              </p>
              <div className="home-hero__actions">
                <a href="#agenda" className="home-hero__button home-hero__button--cream">
                  Próximos eventos e ensaios
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h15M13 5l7 7-7 7" />
                  </svg>
                </a>
                <Link href="/oficina" className="home-hero__button home-hero__button--outline">
                  Quero tocar na Oficina BSP
                </Link>
              </div>
            </div>

            <div className="home-hero__media home-hero__media--complete">
              <HomeHeroImage />
              <div className="home-hero__seal" aria-hidden="true">
                <svg className="home-hero__badge" viewBox="0 0 140 140">
                  <circle className="home-hero__badge-disc" cx="70" cy="70" r="66" />
                  <defs>
                    <path id="home-hero-badge-path" d="M70 70m-51 0a51 51 0 1 1 102 0a51 51 0 1 1-102 0" />
                  </defs>
                  <g className="home-hero__badge-type">
                    <text>
                      <textPath href="#home-hero-badge-path">Samba-reggae · Brasília · Desde 2013 · </textPath>
                    </text>
                  </g>
                </svg>
                <LogoMark className="home-hero__badge-mark" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de prova social: retorna para logo abaixo da Hero. */}
      <ArtistsMarquee />

      {/* 02 · AGENDA: primeiro conteúdo depois da apresentação. */}
      <section className="section-pad scroll-mt-24 bg-areia/70 py-16 sm:py-24" id="agenda">
        <div className="container-bsp">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="chip bg-sol text-creme">A rua tem hora marcada</span>
              <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Agenda & eventos</h2>
              <p className="mt-3 max-w-2xl text-base font-semibold text-tinta/75 sm:text-lg">
                Cortejos, ensaios abertos e encontros do Santo Pecado. Consulte a programação publicada pela equipe.
              </p>
            </div>
            <SeeAll href="/galeria#agenda">Agenda completa</SeeAll>
          </div>
          <div className="home-events-agenda mt-9">
            <HomeCalendar today={today} events={calendarEvents} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-extrabold">
            <span className="rounded-full bg-lago px-3 py-1.5 text-creme">Cortejo gratuito</span>
            <span className="rounded-full bg-sol px-3 py-1.5 text-creme">Ensaio aberto</span>
            <span className="rounded-full bg-tinta px-3 py-1.5 text-creme">Evento pago</span>
          </div>
        </div>
      </section>

      {/* 03 · PROVA SOCIAL E HISTÓRIA. */}
      <section className="relative overflow-hidden bg-creme section-pad py-16 sm:py-20" id="historia-resumida">
        <Spiral className="pointer-events-none absolute -left-40 top-16 h-[30rem] w-[30rem] text-sol/10" stroke={6} />
        <div className="container-bsp relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="chip bg-sol-100 text-sol-600">Nossa caminhada</span>
              <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">
                Um sonho de amigos
                <br />
                <span className="text-sol">que virou rua.</span>
              </h2>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-tinta/85">
                <p>
                  O Bloco Santo Pecado nasceu em Brasília em <strong>15 de janeiro de 2013</strong>, idealizado pelos irmãos João Gustavo (Jonny) e Rodolpho Xéu. A maioria dos músicos nunca tinha encostado em um instrumento — e a missão sempre foi levar música de graça para todos.
                </p>
                <p>
                  A estreia nas ruas foi na orla da Ponte JK. De lá para cá vieram grandes carnavais, palcos ao lado de artistas nacionais e uma turnê pela Ásia.
                </p>
              </div>
              <Link href="/historia" className="btn btn-sol mt-8">Conhecer nossa história completa</Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {[
                { n: "2013", t: "Ano de fundação", c: "bg-sol text-creme" },
                { n: "23", t: "amigos no primeiro dia", c: "bg-lago text-creme" },
                { n: "32", t: "integrantes em 2014", c: "bg-lago-100 text-lago-700" },
                { n: "Ásia", t: "turnê internacional", c: "bg-sol-100 text-lago-700" },
              ].map((item, index) => (
                <div key={item.t} className={`${item.c} rounded-[2rem] p-6 sm:p-8 ${index % 2 ? "translate-y-6" : ""}`}>
                  <p className="font-display text-5xl sm:text-6xl">{item.n}</p>
                  <p className="mt-2 font-semibold">{item.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04 · ATALHOS EDITORIAIS: as experiências completas ficam nas páginas internas. */}
      <section className="section-pad bg-areia/70 py-12 sm:py-14" id="explore-bsp">
        <div className="container-bsp">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="chip bg-sol-100 text-sol-600">Mais para conhecer</span>
              <h2 className="font-display mt-3 text-3xl text-lago sm:text-4xl">Entre no universo Santo Pecado</h2>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-tinta/70 sm:text-base">
                Aprenda com a bateria, descubra os sons que movem o bloco e veja o Santo Pecado na rua — cada experiência no seu espaço.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/oficina"
              className="group flex min-h-[148px] flex-col rounded-2xl border border-lago/10 bg-creme p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sol/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sol"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sol/15 text-sol-600" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="7" rx="7.5" ry="3.5" />
                  <path d="M4.5 7v8c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5V7M7.5 10.2l9 4.2M16.5 10.2l-9 4.2" />
                </svg>
              </span>
              <span className="font-display text-xl text-lago">Oficina BSP</span>
              <span className="mt-1 text-sm leading-relaxed text-tinta/70">Samba-reggae na prática com o Mestre Reinaldo Bráz, do primeiro toque aos quatro naipes.</span>
              <span className="mt-auto pt-4 text-sm font-extrabold text-sol-600">Conhecer a oficina <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
            </Link>

            <Link
              href="/inspiracoes"
              className="group flex min-h-[148px] flex-col rounded-2xl border border-lago/10 bg-creme p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sol/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sol"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lago/10 text-lago" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h2l2.2-6 4.1 12 3.4-10 2.1 4H21" />
                </svg>
              </span>
              <span className="font-display text-xl text-lago">Sons & Inspirações</span>
              <span className="mt-1 text-sm leading-relaxed text-tinta/70">Escute os timbres dos naipes e conheça as referências musicais por trás da nossa batida.</span>
              <span className="mt-auto pt-4 text-sm font-extrabold text-sol-600">Explorar os sons <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
            </Link>

            <Link
              href="/galeria"
              className="group flex min-h-[148px] flex-col rounded-2xl border border-lago/10 bg-creme p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sol/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sol"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sol/15 text-sol-600" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2.5" />
                  <circle cx="8.5" cy="9" r="1.5" />
                  <path d="m21 15-5-5L5 20" />
                </svg>
              </span>
              <span className="font-display text-xl text-lago">Galeria</span>
              <span className="mt-1 text-sm leading-relaxed text-tinta/70">Registros de Carnaval, shows, cortejos e momentos da Oficina BSP para rever e compartilhar.</span>
              <span className="mt-auto pt-4 text-sm font-extrabold text-sol-600">Ver fotos e vídeos <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span></span>
            </Link>
          </div>
        </div>
      </section>

      {/* 05 · CONTRATAÇÃO: oferta clara antes do rodapé. */}
      <section className="section-pad py-16 sm:py-24" id="contrate-o-bloco">
        <div className="container-bsp">
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-sol px-7 py-10 text-creme sm:px-12 sm:py-14">
            <LogoMark className="pointer-events-none absolute -bottom-12 -right-12 -z-10 h-72 w-72 text-creme/15" />
            <div className="max-w-3xl">
              <span className="chip bg-creme text-sol-600">Shows & eventos</span>
              <h2 className="font-display mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">Leve a energia do Santo Pecado para o seu evento.</h2>
              <p className="mt-5 max-w-2xl text-lg text-creme/90">Festas, casamentos, eventos corporativos e festivais: a bateria do BSP chega junto para transformar encontro em celebração.</p>
              <Link href="/contato?assunto=contratar" className="btn btn-lago mt-8">Pedir orçamento <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
