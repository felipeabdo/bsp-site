import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { LogoMark, Spiral } from "@/components/art";
import Img from "@/components/Img";

export const metadata: Metadata = { title: "História · Dossiê do bloco" };

type Entry = {
  year: string;
  date?: string;
  title: string;
  text: string;
  tag: string;
  photo?: string;
  tone?: "sol" | "lago";
};

const TIMELINE: Entry[] = [
  {
    year: "2013",
    date: "15 de janeiro",
    title: "Nasce o Bloco Santo Pecado",
    text: "Os irmãos João Gustavo (Jonny) e Rodolpho Xéu reúnem 23 amigos de Brasília — quase todos brasilienses, a maioria sem nenhum contato prévio com instrumentos — para fazer percussão gratuita pela cidade. O estatuto já deixava claro: levar música de graça para todos.",
    tag: "Fundação",
    tone: "sol",
  },
  {
    year: "2013",
    date: "2 de junho",
    title: "Estreia na rua: orla da Ponte JK",
    text: "A primeira apresentação aconteceu ao entardecer, na orla da Ponte JK. É o marco que o bloco celebra como sua estreia nas ruas — e o início de uma sequência de apresentações em cartões-postais de Brasília.",
    tag: "Estreia",
    photo: "https://images.pexels.com/photos/31022399/pexels-photo-31022399.jpeg?cs=srgb&dl=pexels-mendez-692552722-31022399.jpg&fm=jpg",
    tone: "lago",
  },
  {
    year: "2013–15",
    title: "Brasília inteira vira palco",
    text: "Torre de TV, Centro de Convenções, Eixão do Lazer, orla da Ponte do Bragueto, Museu da República, Parque da Cidade: o bloco ocupou espaços públicos e incentivou a visitação desses pontos, além de clubes, festas e casas de show.",
    tag: "Ocupação da cidade",
    tone: "sol",
  },
  {
    year: "2014",
    date: "A partir de setembro",
    title: "Ensaios semanais no Outro Calaf",
    text: "Aos domingos, a partir das 16h, o ensaio do Santo Pecado passou a ocupar o Outro Calaf (SBS). Com 27 a 32 integrantes — conforme a imprensa da época — e o Mestre Reinaldo Bráz à frente da bateria, o repertório misturava samba-reggae, axé, rock e samba.",
    tag: "Ensaio",
    photo: "https://images.pexels.com/photos/28538697/pexels-photo-28538697/free-photo-of-energetic-carnival-street-drumming-performance.jpeg?auto=compress&dpr=1&h=1200&w=1800",
    tone: "lago",
  },
  {
    year: "2015",
    date: "18 de setembro",
    title: "Noite de axé na Bamboa",
    text: "O bloco divide a noite com o compositor Alexandre Peixe, consolidando a presença em casas de show de Brasília.",
    tag: "Show",
    tone: "sol",
  },
  {
    year: "2017",
    title: "Prainha, Pelourinho e pré-carnavais",
    text: "Em janeiro, o Bloquinho das Antigas leva o bloco e Guga Camafeu à prainha do Clube da Engenharia, à beira-lago. Em março, a festa Pelourinho na Bamboa Brasil reúne Parangolé e Santo Pecado.",
    tag: "Shows",
    photo: "https://images.pexels.com/photos/20440263/pexels-photo-20440263.jpeg?cs=srgb&dl=pexels-maurylio-silva-251773867-20440263.jpg&fm=jpg",
    tone: "lago",
  },
  {
    year: "2018",
    date: "10 de fevereiro",
    title: "Carnaval no circuito da Ponte JK",
    text: "Evento aberto e gratuito, a partir das 15h, com samba-reggae e clássicos de Olodum, Timbalada e Chiclete com Banana — de volta ao lugar da primeira apresentação.",
    tag: "Carnaval",
    photo: "https://images.pexels.com/photos/17016463/pexels-photo-17016463.png?cs=srgb&dl=pexels-2mephoto-17016463.jpg&fm=jpg",
    tone: "sol",
  },
  {
    year: "Ásia",
    title: "O Santo Pecado cruza o mundo",
    text: "Em algum ponto da trajetória, o bloco embarcou em uma turnê na Ásia — com a viagem ao Japão. Veja o capítulo especial mais abaixo.",
    tag: "Internacional",
    tone: "lago",
  },
  {
    year: "2023",
    date: "11 de fevereiro",
    title: "Pré-Carnaval no Conjunto Nacional",
    text: "Folia gratuita no Jardim Urbano, com 14 integrantes em cena e repertório que passeia por Tim Maia, Lulu Santos, Paralamas do Sucesso e O Rappa.",
    tag: "Pré-carnaval",
    tone: "sol",
  },
  {
    year: "2024",
    date: "11 de fevereiro",
    title: "Depois do Monobloco, é Santo Pecado",
    text: "Na AABB, o bloco assume a festa à 0h30, após o show do tradicional bloco carioca, ao lado de Clima de Montanha e do DJ Jonnes.",
    tag: "Show",
    photo: "https://images.pexels.com/photos/2231987/pexels-photo-2231987.jpeg?cs=srgb&dl=pexels-caricatte-2231987.jpg&fm=jpg",
    tone: "lago",
  },
  {
    year: "2026",
    date: "17 de fevereiro",
    title: "Carnaval 2026 e nova identidade",
    text: "Terça-feira de Carnaval na orla da Terceira Ponte, com a nova identidade visual do bloco — tridente alado, auréola, espirais e a frase que resume tudo: “Eu curto bloco de rua!”.",
    tag: "Carnaval 2026",
    tone: "sol",
  },
];

const FICHA = [
  ["Fundação", "15 de janeiro de 2013, Brasília (DF)"],
  ["Fundadores", "João Gustavo “Jonny” e Rodolpho “Xéu”"],
  ["Primeira apresentação", "2 de junho de 2013 · orla da Ponte JK"],
  ["Mestre", "Reinaldo Bráz"],
  ["Estilo motriz", "Samba-reggae (com axé, rock, soul e samba)"],
  ["Missão", "Levar música de graça para todos"],
];

const FUNDAMENTOS = [
  "Olodum",
  "Timbalada",
  "Ilê Aiyê",
  "Chiclete com Banana",
  "Ivete Sangalo",
  "Jorge Ben Jor",
  "Tim Maia",
  "Bob Marley",
  "Paralamas do Sucesso",
  "O Rappa",
  "Lulu Santos",
];

const JAPAN_STORIES = [
  { label: "旅程 · Roteiro", title: "Roteiro", text: "Cidades, datas e palcos da turnê." },
  { label: "仲間 · Quem foi", title: "Quem foi", text: "Integrantes que embarcaram na viagem." },
  { label: "舞台裏 · Bastidores", title: "Bastidores", text: "Ensaios, estradas, trens-bala e encontros." },
];

const JAPAN_PHOTOS = [
  {
    label: "Palco no Japão",
    src: "https://images.pexels.com/photos/30642901/pexels-photo-30642901.jpeg?cs=srgb&dl=pexels-shakir1317-30642901.jpg&fm=jpg",
    alt: "Detalhe de tambor taiko em festival japonês; foto ilustrativa.",
  },
  {
    label: "Ensaio",
    src: "https://images.pexels.com/photos/40730402/pexels-photo-40730402.jpeg?cs=srgb&dl=pexels-carlos-cardona-1140111-40730402.jpg&fm=jpg",
    alt: "Mulher tocando taiko em festival japonês; foto ilustrativa.",
  },
  {
    label: "Bastidores",
    src: "https://images.pexels.com/photos/37618340/pexels-photo-37618340.jpeg?cs=srgb&dl=pexels-iban-lopez-luna-2159602676-37618340.jpg&fm=jpg",
    alt: "Cortejo de festival em rua de Tóquio; foto ilustrativa.",
  },
  {
    label: "Encontros",
    src: "https://images.pexels.com/photos/33054090/pexels-photo-33054090.jpeg?cs=srgb&dl=pexels-pincalo-33054090.jpg&fm=jpg",
    alt: "Carro alegórico de festival japonês com percussionistas; foto ilustrativa.",
  },
];

export default function HistoriaPage() {
  return (
    <>
      <PageHero
        eyebrow="Dossiê completo"
        title="Uma década"
        accent="de tambor"
        subtitle="Da primeira batida na orla da Ponte JK ao palco na Ásia: a história do Bloco Santo Pecado contada em ordem cronológica, com o que a imprensa e o próprio bloco registraram."
        aside={
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
            {[
              ["2013", "Fundação do bloco"],
              ["23", "Amigos na origem"],
              ["01", "Capítulo internacional"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl border border-creme/10 bg-creme/10 px-3 py-3 backdrop-blur-sm sm:rounded-2xl sm:px-5 sm:py-4">
                <p className="font-display text-xl leading-none text-sol sm:text-3xl">{value}</p>
                <p className="mt-1.5 text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.08em] text-creme/75 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
        }
      >
        <div className="flex flex-wrap gap-2.5">
          <a href="#linha-do-tempo" className="btn btn-sol !rounded-full !px-5 !py-3 text-sm">Linha do tempo</a>
          <a href="#japao" className="btn btn-creme !rounded-full !px-5 !py-3 text-sm">Capítulo Japão</a>
        </div>
      </PageHero>

      {/* Ficha e referências musicais — conteúdo original reaproveitado. */}
      <section className="section-pad py-12 sm:py-16">
        <div className="container-bsp grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)] lg:gap-8">
          <div>
            <span className="chip bg-sol-100 text-sol-600">Ficha técnica</span>
            <h2 className="font-display mt-3 text-3xl text-lago sm:text-4xl">O bloco em uma página</h2>
            <dl className="mt-5 divide-y divide-tinta/10 overflow-hidden rounded-2xl bg-white ring-1 ring-tinta/5">
              {FICHA.map(([key, value]) => (
                <div key={key} className="grid gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:px-5">
                  <dt className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sol-600">{key}</dt>
                  <dd className="text-sm font-medium leading-snug text-tinta">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-lago p-6 text-creme sm:p-7">
            <Spiral className="pointer-events-none absolute -right-8 -top-9 h-28 w-28 text-sol" />
            <LogoMark className="relative h-8 w-8 text-creme" wing="#F9834E" />
            <h3 className="font-display relative mt-3 max-w-sm text-2xl sm:text-3xl">O som que a gente carrega</h3>
            <p className="relative mt-3 text-sm leading-relaxed text-creme/90">
              “Os fundamentos são as bandas de samba-reggae e o próprio Ilê.” — Xéu, vocalista, ao explicar as bases do
              bloco em 2014. Referências de artistas contemporâneos, como O Rappa e Tim Maia, completam o caldo.
            </p>
            <ul className="relative mt-4 flex flex-wrap gap-1.5">
              {FUNDAMENTOS.map((foundation) => (
                <li key={foundation} className="rounded-full border border-creme/25 bg-creme/10 px-2.5 py-1 text-[0.62rem] font-semibold text-creme">
                  {foundation}
                </li>
              ))}
            </ul>
            <Link href="/inspiracoes" className="btn btn-sol relative mt-5 !rounded-full !px-4 !py-2.5 text-xs">
              Ouvir os instrumentos
            </Link>
          </div>
        </div>
      </section>

      {/* Linha do tempo */}
      <section id="linha-do-tempo" className="section-pad scroll-mt-24 bg-areia/70 py-14 sm:py-20">
        <div className="container-bsp">
          <div className="mx-auto max-w-5xl">
            <span className="chip bg-lago text-creme">Cronologia</span>
            <h2 className="font-display mt-3 text-4xl text-lago sm:text-5xl">Linha do tempo</h2>
            <p className="mt-2 max-w-2xl text-sm text-tinta/65">
              Uma história construída em Brasília, com registros de apresentações, encontros e novos caminhos.
            </p>
          </div>

          <ol className="relative mx-auto mt-9 max-w-5xl space-y-3 before:absolute before:bottom-3 before:left-[0.45rem] before:top-2 before:border-l-2 before:border-dashed before:border-sol/70 lg:space-y-4 lg:before:left-1/2 lg:before:-translate-x-1/2">
            {TIMELINE.map((entry, index) => {
              const onLeft = index % 2 === 0;
              const isAsia = entry.year === "Ásia";
              const isLatest = index === TIMELINE.length - 1;
              const darkCard = isAsia || isLatest;
              const yearTone = darkCard ? "text-sol" : entry.tone === "lago" ? "text-lago" : "text-sol";

              return (
                <li key={entry.title} className="relative grid pl-8 lg:grid-cols-2 lg:gap-12 lg:pl-0">
                  <span
                    className={`absolute left-0 top-4 z-10 h-4 w-4 rounded-full border-[3px] border-areia shadow-sm lg:left-1/2 lg:-translate-x-1/2 ${
                      entry.tone === "lago" ? "bg-lago" : "bg-sol"
                    }`}
                    aria-hidden="true"
                  />
                  <article
                    className={`relative w-full rounded-2xl p-4 shadow-[0_5px_18px_rgba(33,72,91,0.06)] ring-1 sm:p-5 ${
                      darkCard
                        ? "bg-lago text-creme ring-lago"
                        : "bg-white text-tinta ring-tinta/5"
                    } ${onLeft ? "lg:col-start-1 lg:mr-5 lg:text-right" : "lg:col-start-2 lg:ml-5"}`}
                  >
                    {isAsia && <Spiral className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 text-sol" />}
                    <div className={`relative flex flex-wrap items-center gap-2 ${onLeft ? "lg:justify-end" : ""}`}>
                      <span className={`font-display text-2xl leading-none sm:text-3xl ${yearTone}`}>{entry.year}</span>
                      <span className={`rounded-full px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] ${darkCard ? "bg-creme/15 text-creme" : "bg-areia text-tinta/70"}`}>
                        {entry.tag}
                      </span>
                    </div>
                    {entry.date && (
                      <p className={`mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${darkCard ? "text-creme/60" : "text-tinta/55"}`}>
                        {entry.date}
                      </p>
                    )}
                    <h3 className={`relative mt-2 text-sm font-bold leading-snug sm:text-base ${darkCard ? "text-creme" : "text-lago"}`}>
                      {entry.title}
                    </h3>
                    <p className={`relative mt-1.5 text-xs leading-relaxed sm:text-[0.82rem] ${darkCard ? "text-creme/80" : "text-tinta/70"}`}>
                      {entry.text}
                    </p>
                    {entry.photo && (
                      <Img
                        src={entry.photo}
                        alt={`Fotografia ilustrativa de carnaval ou cortejo — referência: ${entry.title}; não é um registro oficial do BSP.`}
                        className="relative mt-3 aspect-[16/8] w-full rounded-xl object-cover"
                      />
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
          <p className="mx-auto mt-5 max-w-5xl text-[0.68rem] text-tinta/55">
            As fotografias da cronologia são ilustrativas, provenientes de bancos gratuitos; não afirmam retratar os eventos históricos do BSP. Créditos em <code>/images/ASSETS-PEXELS.md</code>.
          </p>
        </div>
      </section>

      {/* Capítulo Japão — grafismos japoneses criados para esta seção. */}
      <section id="japao" className="relative isolate scroll-mt-24 overflow-hidden bg-[#F4774B] py-14 text-creme sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ backgroundImage: "url('/images/japan-seigaiha.svg')", backgroundRepeat: "repeat" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -right-24 -top-28 -z-0 h-72 w-72 rounded-full bg-[#E73525] sm:-right-20 sm:-top-36 sm:h-[27rem] sm:w-[27rem]" aria-hidden="true" />

        <div className="container-bsp section-pad relative z-10 grid gap-5 lg:grid-cols-[3.5rem_minmax(0,1fr)] lg:gap-7">
          <aside className="hidden justify-center pt-2 lg:flex" aria-label="Santo Pecado em japonês">
            <span className="[writing-mode:vertical-rl] font-serif text-2xl tracking-[0.32em] text-[#183D4E]">
              日本のサントペカド
            </span>
          </aside>

          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#183D4E] px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-creme">
                Capítulo especial · 日本
              </span>
              <span className="hidden text-xs font-semibold tracking-[0.16em] text-[#81391F] sm:inline">ブラジルから日本へ</span>
            </div>

            <h2 className="mt-5 font-serif text-[clamp(2.8rem,8vw,6.2rem)] font-medium uppercase leading-[0.88] tracking-[0.015em] text-creme">
              <span className="block">Santo Pecado</span>
              <span className="mt-1 block">no Japão</span>
            </h2>
            <p className="mt-5 max-w-3xl text-sm font-medium leading-relaxed text-[#FFF5E8] sm:text-base">
              Um bloco de Brasília levando samba-reggae para o outro lado do mundo. A imprensa brasiliense registra que o
              Santo Pecado já fez uma turnê na Ásia ao lado de shows com grandes artistas nacionais — um orgulho para
              quem começou com 23 amigos e uma ideia na orla.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {JAPAN_STORIES.map((story) => (
                <article key={story.title} className="rounded-xl bg-[#F8EEDC] p-4 text-tinta shadow-[0_8px_20px_rgba(105,48,28,0.12)] sm:p-5">
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.13em] text-[#D34F32]">{story.label}</p>
                  <h3 className="font-display mt-2 text-xl text-lago sm:text-2xl">{story.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-tinta/75">{story.text}</p>
                  <p className="mt-4 border-t border-[#D9C7AE] pt-2 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[#D34F32]">
                    A completar com o grupo
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {JAPAN_PHOTOS.map((photo, index) => (
                <figure key={photo.label} className={`group relative overflow-hidden rounded-xl border-2 border-creme/90 bg-[#183D4E] shadow-[0_8px_22px_rgba(69,38,26,0.2)] ${index === 1 ? "sm:translate-y-2" : ""}`}>
                  <Img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#102B39]/90 to-transparent px-2 pb-2 pt-7 text-[0.65rem] font-bold text-creme sm:text-xs">
                    {photo.label}
                  </figcaption>
                </figure>
              ))}
            </div>

            <p className="mt-5 max-w-3xl text-xs leading-relaxed text-creme/90">
              Dossiê em construção: envie fotos, vídeos e relatos da viagem pela{" "}
              <Link href="/contato" className="font-bold underline decoration-creme/70 underline-offset-2">página de contato</Link>{" "}
              ou direto no Instagram do bloco e dos integrantes, e eles entram aqui.
            </p>
          </div>
        </div>
      </section>

      {/* In memoriam + Fontes */}
      <section className="section-pad py-12 sm:py-16">
        <div className="container-bsp grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-7">
          <div className="relative overflow-hidden rounded-2xl bg-lago p-6 text-creme sm:p-8">
            <Spiral className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 text-sol/80" />
            <span className="chip bg-creme/15 text-creme">In memoriam</span>
            <h3 className="font-display relative mt-4 text-3xl sm:text-4xl">Vinícius Jubinha</h3>
            <p className="relative mt-3 text-sm leading-relaxed text-creme/90">
              Integrante querido do bloco, Jubinha — que tocava dobra e aparece desde as primeiras formações — partiu em
              março de 2024. Seu ritmo segue no coração de quem toca e dança com o Santo Pecado.
            </p>
          </div>

          <div className="rounded-2xl bg-areia p-6 sm:p-8">
            <h3 className="font-display text-2xl text-lago sm:text-3xl">Fontes consultadas</h3>
            <p className="mt-2 text-xs leading-relaxed text-tinta/75 sm:text-sm">
              Este dossiê foi montado a partir de reportagens e materiais públicos, e será ampliado com os arquivos do bloco.
            </p>
            <ul className="mt-4 space-y-2 text-xs font-medium leading-relaxed text-tinta/85">
              {[
                "Desfrute Cultural — “Bloco Santo Pecado no Outro Calaf” (2014)",
                "Divirta-se Mais / Correio Braziliense — ensaios no Outro Calaf (2014)",
                "Jornal de Brasília — Alexandre Peixe na Bamboa (2015)",
                "Jornal Daqui DF — Bloquinho das Antigas (2017)",
                "Esporte Cultura — Pelourinho na Bamboa Brasil (2017)",
                "Brasília de Fato — Carnaval na Ponte JK (2018)",
                "ABRASCE — Pré-Carnaval no Conjunto Nacional (2023)",
                "Imprensa Brasília — Carnaval do Monobloco (2024)",
                "Metrópoles — nota sobre Vinícius Jubinha (2024)",
              ].map((source) => (
                <li key={source} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sol" aria-hidden="true" />
                  {source}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
