import Link from "next/link";
import { LogoMark, Spiral, SpiralBackdrop } from "@/components/art";
import ArtistsMarquee from "@/components/ArtistsMarquee";
import { SeeAll } from "@/components/Calendar";
import HomeCalendar from "@/components/HomeCalendar";
import HomeAlbums from "@/components/HomeAlbums";
import Img from "@/components/Img";

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

export default function Home() {
  const today = saoPauloToday();

  return (
    <>
      {/* HERO: estrutura da referência, com a fotografia e o tridente oficiais do projeto real. */}
      <section className="home-hero relative isolate w-full overflow-hidden bg-lago text-creme">
        <SpiralBackdrop className="pointer-events-none absolute -right-[15%] top-[4%] z-0 aspect-[1.21] w-[min(66vw,58rem)] text-creme/10" />
        <Spiral className="pointer-events-none absolute -bottom-28 -left-24 z-0 h-80 w-80 text-sol/15" stroke={8} />

        <div className="home-hero__stage relative z-10">
          <div className="container-bsp section-pad home-hero__grid">
            <div className="home-hero__copy">
              <h1 className="home-hero__title">
                Eu curto <em>bloco</em>
                <br />
                de rua!
              </h1>
              <p className="home-hero__description">
                Uma big band percussiva que nasceu do encontro de amigos e hoje faz Brasília dançar com a força do samba-reggae, do axé e da música de rua.
              </p>
              <div className="home-hero__actions">
                <Link href="/galeria#agenda" className="home-hero__button home-hero__button--cream">
                  Próximos eventos
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h15M13 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link href="/historia" className="home-hero__button home-hero__button--outline">
                  Nossa história
                </Link>
              </div>
            </div>

            <div className="home-hero__media home-hero__media--complete">
              <Img
                src="/brand/photos/home-hero-complete.png"
                alt="Quatro integrantes do Bloco Santo Pecado reunidos no arco, com o cantor de boné e a cantora em primeiro plano e os dois integrantes de dreadlocks nas laterais"
                className="home-hero__complete"
                priority
              />
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

        <ArtistsMarquee />
      </section>

      {/* ───────────── HISTÓRIA ───────────── */}
      <section className="section-pad relative overflow-hidden py-20 sm:py-28">
        <Spiral className="pointer-events-none absolute -left-40 top-10 h-[30rem] w-[30rem] text-sol/10" stroke={6} />
        <div className="container-bsp relative grid items-center gap-14 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-5xl text-lago sm:text-6xl">
              Um sonho de amigos
              <br />
              <span className="text-sol">que virou rua.</span>
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-tinta/85">
              <p>
                O Bloco Santo Pecado nasceu em Brasília em <strong>15 de janeiro de 2013</strong>, idealizado pelos irmãos
                João Gustavo (Jonny) e Rodolpho Xéu. A maioria dos músicos nunca tinha encostado em um instrumento — e
                o estatuto já trazia uma missão: <em>levar música de graça para todos</em>.
              </p>
              <p>
                A estreia nas ruas foi em <strong>2 de junho de 2013</strong>, ao entardecer, na orla da Ponte JK. De lá
                para cá vieram Torre de TV, Eixão do Lazer, Museu da República, grandes carnavais, shows ao lado de
                artistas nacionais e até uma turnê pela Ásia.
              </p>
            </div>
            <Link href="/historia" className="btn btn-sol mt-8">
              Ler o dossiê completo
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "2013", t: "Ano de fundação", c: "bg-sol text-creme" },
              { n: "23", t: "amigos no primeiro dia", c: "bg-lago text-creme" },
              { n: "32", t: "integrantes em 2014", c: "bg-lago-100 text-lago-700" },
              { n: "Ásia", t: "turnê internacional", c: "bg-sol-100 text-lago-700" },
            ].map((s, i) => (
              <div key={s.t} className={`${s.c} rounded-[2rem] p-6 sm:p-8 ${i % 2 ? "translate-y-6" : ""}`}>
                <p className="font-display text-5xl sm:text-6xl">{s.n}</p>
                <p className="mt-2 font-semibold">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── ÁLBUNS + AGENDA ───────────── */}
      <section className="section-pad bg-areia/70 py-20 sm:py-24" id="eventos">
        <div className="container-bsp">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-5xl text-lago sm:text-6xl">Últimos eventos</h2>
              <p className="mt-3 max-w-xl text-base font-semibold text-tinta/75 sm:text-lg">
                Cada momento tem seu álbum. Escolha um evento e veja os registros que fazem parte dele.
              </p>
            </div>
            <SeeAll href="/galeria">Ver galeria completa</SeeAll>
          </div>

          <div className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl text-lago">Álbuns em destaque</h3>
                <p className="mt-1 text-sm font-semibold text-tinta/65">Abra um álbum para explorar as fotos daquele evento.</p>
              </div>
            </div>
            <HomeAlbums />
          </div>

          <div className="home-events-agenda mt-10">
            <HomeCalendar today={today} />
          </div>
          <p className="mt-5 text-xs text-tinta/55">
            Imagens ilustrativas temporárias. Os álbuns receberão os registros oficiais de cada evento.
          </p>
        </div>
      </section>

      {/* ───────────── CTAs ───────────── */}
      <section className="section-pad py-20 sm:py-24">
        <div className="container-bsp grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-lago p-8 text-creme sm:p-12">
            <Spiral className="absolute -bottom-16 -right-16 h-72 w-72 text-sol" stroke={9} />
            <h3 className="font-display text-5xl sm:text-6xl">
              Aprenda samba-reggae com o <span className="text-sol">Mestre Reinaldo Bráz</span>
            </h3>
            <p className="mt-4 max-w-md text-lg text-creme/90">Sem exigir experiência. Venha tocar surdo, repinique, timbal e caixa.</p>
            <Link href="/oficina" className="btn btn-sol mt-8">
              Quero participar
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-sol p-8 text-creme sm:p-12">
            <LogoMark className="absolute -bottom-6 -right-6 h-64 w-64 text-creme/25" />
            <h3 className="font-display text-5xl sm:text-6xl">
              Tem tambor? <span className="text-lago">Tem carteirinha.</span>
            </h3>
            <p className="mt-4 max-w-md text-lg text-creme/95">
              Cadastre-se, receba seu ID (ano-ordem, como 2013-001) e tenha sua carteirinha e seu destaque na página de
              integrantes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/cadastro" className="btn btn-lago">
                Criar meu cadastro
              </Link>
              <Link href="/integrantes" className="btn btn-creme">
                Conhecer o time
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
