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

export default function HistoriaPage() {
  return (
    <>
      <PageHero
        eyebrow="Dossiê completo"
        title="Uma década"
        accent="de tambor"
        subtitle="Da primeira batida na orla da Ponte JK ao palco na Ásia: a história do Bloco Santo Pecado contada em ordem cronológica, com o que a imprensa e o próprio bloco registraram."
      >
        <div className="flex flex-wrap gap-3">
          <a href="#linha-do-tempo" className="btn btn-sol">Linha do tempo</a>
          <a href="#japao" className="btn btn-creme">Capítulo Japão</a>
        </div>
      </PageHero>

      {/* Ficha */}
      <section className="section-pad py-16 sm:py-20">
        <div className="container-bsp grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <span className="chip bg-sol-100 text-sol-600">Ficha técnica</span>
            <h2 className="font-display mt-4 text-4xl text-lago sm:text-5xl">O bloco em uma página</h2>
            <dl className="mt-8 divide-y divide-tinta/10 rounded-[2rem] bg-white p-2 ring-1 ring-tinta/5">
              {FICHA.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-sm font-semibold uppercase tracking-wide text-sol-600">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-lago p-8 text-creme sm:p-12">
            <Spiral className="absolute -right-20 -top-20 h-72 w-72 text-sol/20" stroke={8} />
            <LogoMark className="relative h-16 w-16 text-creme" wing="#F9834E" />
            <h3 className="font-display relative mt-6 text-4xl sm:text-5xl">O som que a gente carrega</h3>
            <p className="relative mt-4 text-lg text-creme/90">
              “Os fundamentos são as bandas de samba-reggae e o próprio Ilê.” — Xéu, vocalista, ao explicar as bases do
              bloco em 2014. Referências de artistas contemporâneos, como O Rappa e Tim Maia, completam o caldo.
            </p>
            <ul className="relative mt-6 flex flex-wrap gap-2">
              {FUNDAMENTOS.map((f) => (
                <li key={f} className="chip bg-creme/15 text-creme">{f}</li>
              ))}
            </ul>
            <Link href="/inspiracoes" className="btn btn-sol relative mt-8">Ouvir os instrumentos</Link>
          </div>
        </div>
      </section>

      {/* Linha do tempo */}
      <section id="linha-do-tempo" className="section-pad scroll-mt-24 bg-areia/70 py-20 sm:py-28">
        <div className="container-bsp">
          <span className="chip bg-lago text-creme">Cronologia</span>
          <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Linha do tempo</h2>
          <p className="mt-3 max-w-3xl text-sm text-tinta/65">As fotografias desta linha do tempo vêm de bancos gratuitos e são ilustrativas; não afirmam retratar os eventos históricos do BSP. Créditos e fontes em <code>/images/ASSETS-PEXELS.md</code>.</p>

          <ol className="relative mt-14 space-y-10 before:absolute before:left-[1.35rem] before:top-0 before:h-full before:w-1 before:rounded-full before:bg-sol/40 lg:before:left-1/2 lg:before:-translate-x-1/2">
            {TIMELINE.map((e, i) => {
              const right = i % 2 === 0;
              return (
                <li key={e.title} className="relative grid gap-4 pl-14 lg:grid-cols-2 lg:gap-16 lg:pl-0">
                  <span
                    className={`absolute left-0 top-2 grid h-11 w-11 place-items-center rounded-full text-sm font-bold text-creme shadow-lg lg:left-1/2 lg:-translate-x-1/2 ${
                      e.tone === "lago" ? "bg-lago" : "bg-sol"
                    }`}
                  >
                    <Spiral className="h-6 w-6" stroke={14} turns={2.2} />
                  </span>
                  <article
                    className={`rounded-[2rem] bg-white p-6 shadow-[0_6px_0_rgba(40,121,159,0.07)] ring-1 ring-tinta/5 sm:p-8 ${
                      right ? "lg:col-start-1 lg:text-right" : "lg:col-start-2"
                    }`}
                  >
                    <div className={`flex flex-wrap items-center gap-3 ${right ? "lg:justify-end" : ""}`}>
                      <span className={`font-display text-5xl ${e.tone === "lago" ? "text-lago" : "text-sol"}`}>{e.year}</span>
                      <span className="chip bg-areia text-tinta/70">{e.tag}</span>
                    </div>
                    {e.date && <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-tinta/60">{e.date}</p>}
                    <h3 className="font-display mt-3 text-3xl">{e.title}</h3>
                    <p className="mt-3 leading-relaxed text-tinta/85">{e.text}</p>
                    {e.photo && (
                      <Img src={e.photo} alt={`Fotografia ilustrativa de carnaval ou cortejo — referência: ${e.title}; não é um registro oficial do BSP.`} className="mt-5 aspect-[16/9] w-full rounded-2xl object-cover" />
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
          <p className="mt-10 text-sm text-tinta/60">Imagens ilustrativas de banco de imagens.</p>
        </div>
      </section>

      {/* Japão */}
      <section id="japao" className="relative scroll-mt-24 overflow-hidden bg-sol py-20 text-creme sm:py-28">
        <Spiral className="pointer-events-none absolute -left-32 -top-24 h-[32rem] w-[32rem] animate-spin-slower text-lago" stroke={7} />
        <div className="container-bsp section-pad relative">
          <span className="chip bg-creme text-sol-600">Capítulo especial</span>
          <h2 className="font-display mt-4 text-[clamp(2.8rem,8vw,6rem)] uppercase">
            <span className="tilt">Santo Pecado</span> <span className="tilt text-lago">no Japão</span>
          </h2>
          <p className="mt-5 max-w-3xl text-lg font-medium sm:text-xl">
            Um bloco de Brasília levando samba-reggae para o outro lado do mundo. A imprensa brasiliense registra que o
            Santo Pecado já fez uma turnê na Ásia ao lado de shows com grandes artistas nacionais — um orgulho para
            quem começou com 23 amigos e uma ideia na orla.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Roteiro", "Cidades, datas e palcos da turnê."],
              ["Quem foi", "Integrantes que embarcaram na viagem."],
              ["Bastidores", "Ensaios, estradas, trens-bala e encontros."],
            ].map(([t, d]) => (
              <div key={t} className="rounded-[2rem] bg-creme p-7 text-tinta">
                <h3 className="font-display text-3xl text-lago">{t}</h3>
                <p className="mt-2 text-tinta/75">{d}</p>
                <p className="mt-4 chip bg-sol-100 text-sol-600">A completar com o grupo</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: "Palco no Japão", src: "https://images.pexels.com/photos/30642901/pexels-photo-30642901.jpeg?cs=srgb&dl=pexels-shakir1317-30642901.jpg&fm=jpg", alt: "Detalhe de tambor taiko em festival japonês; foto ilustrativa." },
              { label: "Ensaio", src: "https://images.pexels.com/photos/40730402/pexels-photo-40730402.jpeg?cs=srgb&dl=pexels-carlos-cardona-1140111-40730402.jpg&fm=jpg", alt: "Mulher tocando taiko em festival japonês; foto ilustrativa." },
              { label: "Bastidores", src: "https://images.pexels.com/photos/37618340/pexels-photo-37618340.jpeg?cs=srgb&dl=pexels-iban-lopez-luna-2159602676-37618340.jpg&fm=jpg", alt: "Cortejo de festival em rua de Tóquio; foto ilustrativa." },
              { label: "Encontros", src: "https://images.pexels.com/photos/33054090/pexels-photo-33054090.jpeg?cs=srgb&dl=pexels-pincalo-33054090.jpg&fm=jpg", alt: "Carro alegórico de festival japonês com percussionistas; foto ilustrativa." },
            ].map((photo) => (
              <figure key={photo.label} className="relative overflow-hidden rounded-3xl bg-lago">
                <Img src={photo.src} alt={photo.alt} className="aspect-[4/5] w-full object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/90 to-transparent px-3 pb-3 pt-10 text-sm font-bold text-creme">{photo.label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm text-creme/90">
            Dossiê em construção: envie fotos, vídeos e relatos da viagem pela{" "}
            <Link href="/contato" className="font-bold underline">página de contato</Link> ou direto no Instagram do bloco e dos
            integrantes, e eles entram aqui.
          </p>
        </div>
      </section>

      {/* In memoriam + Fontes */}
      <section className="section-pad py-16 sm:py-24">
        <div className="container-bsp grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2.5rem] bg-lago p-8 text-creme sm:p-12">
            <span className="chip bg-creme text-lago-700">In memoriam</span>
            <h3 className="font-display mt-5 text-4xl sm:text-5xl">Vinícius Jubinha</h3>
            <p className="mt-4 text-lg leading-relaxed text-creme/90">
              Integrante querido do bloco, Jubinha — que tocava dobra e aparece desde as primeiras formações — partiu em
              março de 2024. Seu ritmo segue no coração de quem toca e dança com o Santo Pecado.
            </p>
          </div>
          <div className="rounded-[2.5rem] bg-areia p-8 sm:p-12">
            <h3 className="font-display text-3xl text-lago sm:text-4xl">Fontes consultadas</h3>
            <p className="mt-3 text-tinta/75">
              Este dossiê foi montado a partir de reportagens e materiais públicos, e será ampliado com os arquivos do bloco.
            </p>
            <ul className="mt-5 space-y-2 text-sm font-medium">
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
              ].map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sol" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
