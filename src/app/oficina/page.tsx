import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark, Spiral, Waves } from "@/components/art";
import { OficinaForm } from "@/components/Forms";
import { MemberImage } from "@/components/silhouettes";
import { getMember } from "@/lib/members";
import { OFICINA } from "@/lib/site";

export const metadata: Metadata = {
  title: "Oficina BSP · Aprenda samba-reggae",
  description: "Aprenda samba-reggae e axé do zero com o Mestre Reinaldo Bráz, na Oficina do Bloco Santo Pecado em Brasília.",
};
export const dynamic = "force-dynamic";

const INSTRUMENTS = [
  { name: "Surdo", phrase: "O coração grave que faz o peito vibrar.", detail: "Aprenda a marcar o pulso e construir o chão da bateria.", tone: "bg-sol text-creme" },
  { name: "Repinique", phrase: "O chamado e o brilho das viradas.", detail: "Descubra os sinais, as respostas e os desenhos que conduzem a roda.", tone: "bg-lago text-creme" },
  { name: "Timbal", phrase: "A agilidade e o swing das mãos.", detail: "Trabalhe coordenação, acentos e a conversa rítmica das mãos.", tone: "bg-areia text-tinta" },
  { name: "Caixa", phrase: "A cadência e a pressão constante.", detail: "Construa precisão, resistência e a pulsação que costura os naipes.", tone: "bg-tinta text-creme" },
];

const FAQ = [
  {
    question: "Preciso comprar instrumento?",
    answer: "Não. A Oficina BSP disponibiliza instrumentos para você começar nas aulas. A equipe orienta sobre os próximos passos conforme sua evolução.",
  },
  {
    question: "E se eu nunca tiver tocado nada na vida?",
    answer: "Pode chegar sem experiência. O aprendizado começa pelo básico: como segurar a baqueta, reconhecer o pulso e tocar junto com os outros naipes.",
  },
  {
    question: "Posso fazer uma aula experimental?",
    answer: "Sim. Depois da pré-inscrição, a coordenação conversa com você para combinar a primeira vivência e verificar a disponibilidade da turma.",
  },
];

export default async function OficinaPage() {
  const mestre = await getMember("2013-003");

  return (
    <>
      {/* HERO de conversão */}
      <section className="relative isolate overflow-hidden bg-lago text-creme">
        <LogoMark className="pointer-events-none absolute -left-40 -top-32 -z-10 h-[40rem] w-[45rem] text-creme/10" />
        <Waves className="pointer-events-none absolute -bottom-6 left-0 h-40 w-full text-creme/20" />
        <div className="container-bsp section-pad relative grid items-center gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="order-2 lg:order-1">
            <span className="chip bg-sol text-creme">Oficina BSP · Brasília</span>
            <h1 className="font-display mt-5 max-w-4xl text-[clamp(2.8rem,7vw,5.8rem)] leading-[1.04]">
              Nunca tocou um tambor? <span className="text-sol">A gente te coloca para fazer Brasília tremer.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-creme/90 sm:text-xl">
              Aprenda a linguagem do samba-reggae e do axé do zero, na prática, com o Mestre Reinaldo Bráz — o mesmo método que transformou 23 amigos sem experiência em uma big band que já dividiu palco com Saulo, Tomate e Araketu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inscricao" className="btn btn-sol">Garantir minha vaga na próxima turma <span aria-hidden="true">→</span></a>
              <a href="#nipes" className="btn btn-creme">Conhecer os instrumentos</a>
            </div>
            <p className="mt-4 text-sm font-semibold text-creme/65">Sem experiência prévia. Comece no seu ritmo.</p>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-md">
            <div className="absolute inset-x-4 top-8 aspect-square rounded-full border-[24px] border-sol/80" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] border-8 border-creme bg-areia text-lago shadow-2xl">
              {mestre ? (
                <div className="flex h-full w-full items-end justify-center px-4 pt-10">
                  <MemberImage member={mestre} kind="body" className="h-full w-full" />
                </div>
              ) : null}
            </div>
            <span className="absolute -bottom-3 -left-4 -rotate-6 rounded-2xl bg-sol px-4 py-2 font-display text-xl uppercase shadow-xl">Mestre Reinaldo Bráz</span>
            <LogoMark className="absolute -right-4 top-2 h-20 w-20 rotate-6 text-creme" wing="#F9834E" />
          </div>
        </div>
      </section>

      {/* Quebra de objeções */}
      <section className="section-pad py-16 sm:py-24" id="para-quem-e">
        <div className="container-bsp">
          <span className="chip bg-sol-100 text-sol-600">Para quem é a Oficina</span>
          <h2 className="font-display mt-4 max-w-4xl text-4xl text-lago sm:text-5xl lg:text-6xl">Seu primeiro toque pode começar aqui.</h2>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            <article className="rounded-[2rem] bg-sol p-7 text-creme">
              <span className="text-3xl" aria-hidden="true">01</span>
              <h3 className="font-display mt-3 text-3xl">Zero experiência necessária</h3>
              <p className="mt-3 leading-relaxed">Você aprende a segurar a baqueta, reconhecer o pulso e construir seu ritmo desde o começo.</p>
            </article>
            <article className="rounded-[2rem] bg-lago p-7 text-creme">
              <span className="text-3xl" aria-hidden="true">02</span>
              <h3 className="font-display mt-3 text-3xl">Instrumentos disponíveis</h3>
              <p className="mt-3 leading-relaxed">Não precisa ter instrumento próprio para começar. Os instrumentos da oficina estão disponíveis durante as aulas.</p>
            </article>
            <article className="rounded-[2rem] bg-areia p-7 text-tinta ring-1 ring-tinta/10">
              <span className="text-3xl text-sol" aria-hidden="true">03</span>
              <h3 className="font-display mt-3 text-3xl">Comunidade e palco</h3>
              <p className="mt-3 leading-relaxed">Evolua nos ensaios, aprenda em grupo e tenha a chance de integrar o cortejo oficial do bloco.</p>
            </article>
          </div>
        </div>
      </section>

      {/* Os quatro naipes */}
      <section className="section-pad scroll-mt-24 bg-areia/70 py-16 sm:py-24" id="nipes">
        <div className="container-bsp">
          <span className="chip bg-lago text-creme">Escolha seu naipe</span>
          <h2 className="font-display mt-4 max-w-4xl text-4xl text-lago sm:text-5xl lg:text-6xl">Quatro caminhos para entrar na batida.</h2>
          <p className="mt-4 max-w-3xl text-lg text-tinta/75">Experimente os timbres, descubra o que combina com você e aprenda como cada instrumento conversa com o conjunto.</p>
          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {INSTRUMENTS.map((instrument, index) => (
              <article key={instrument.name} className={`${instrument.tone} relative overflow-hidden rounded-[2rem] p-7 sm:p-9`}>
                <Spiral className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 opacity-15" stroke={8} />
                <div className="relative flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.16em] opacity-65">Naipe 0{index + 1}</span>
                  <span className="rounded-full bg-creme/15 px-3 py-1 text-xs font-bold">Aulas práticas</span>
                </div>
                <h3 className="font-display relative mt-5 text-4xl sm:text-5xl">{instrument.name}</h3>
                <p className="relative mt-2 text-lg font-extrabold">{instrument.phrase}</p>
                <p className="relative mt-3 max-w-lg leading-relaxed opacity-85">{instrument.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="#inscricao" className="btn btn-sol">Quero experimentar um naipe <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      {/* Informações práticas */}
      <section className="section-pad py-16 sm:py-24" id="informacoes">
        <div className="container-bsp">
          <span className="chip bg-sol-100 text-sol-600">Organize sua chegada</span>
          <h2 className="font-display mt-4 text-4xl text-lago sm:text-5xl">Informações práticas</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.75rem] bg-lago p-6 text-creme">
              <p className="text-xs font-black uppercase tracking-widest text-sol">Dias e horários</p>
              <h3 className="font-display mt-3 text-2xl">Turmas da oficina</h3>
              <p className="mt-2 leading-relaxed text-creme/85">{OFICINA.schedule}.</p>
            </article>
            <article className="rounded-[1.75rem] bg-areia p-6 text-tinta ring-1 ring-tinta/10">
              <p className="text-xs font-black uppercase tracking-widest text-sol-600">Local</p>
              <h3 className="font-display mt-3 text-2xl">Sede em Brasília</h3>
              <p className="mt-2 leading-relaxed text-tinta/75">A coordenação confirma endereço, turma e orientações de chegada após a pré-inscrição.</p>
            </article>
            <article className="rounded-[1.75rem] bg-sol p-6 text-creme">
              <p className="text-xs font-black uppercase tracking-widest text-creme/80">Valor e planos</p>
              <h3 className="font-display mt-3 text-2xl">Mensalidade</h3>
              <p className="mt-2 leading-relaxed text-creme/90">Consulte os valores e as opções de plano com a coordenação. Os números disponíveis no cadastro interno ainda são ilustrativos, não uma tabela oficial.</p>
            </article>
          </div>
          <p className="mt-5 rounded-2xl border border-sol/20 bg-sol/10 p-4 text-sm font-semibold text-tinta/80">
            Dias, horários, endereço exato e investimento da próxima turma precisam ser confirmados com a equipe antes da matrícula.
          </p>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section className="section-pad bg-areia/70 py-16 sm:py-24" id="faq">
        <div className="container-bsp grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="chip bg-lago text-creme">Dúvidas comuns</span>
            <h2 className="font-display mt-4 text-4xl text-lago sm:text-5xl">Antes de entrar na roda.</h2>
            <p className="mt-4 max-w-md text-tinta/75">A ideia é que você chegue para aprender, não para se preocupar com o que ainda não sabe.</p>
            <Link href="/contato" className="mt-5 inline-flex font-extrabold text-sol-600 underline underline-offset-4">Ainda tem dúvida? Fale com a gente.</Link>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details key={item.question} className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-tinta/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-lago marker:hidden">
                  <span>{item.question}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sol text-creme transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-4 max-w-2xl leading-relaxed text-tinta/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de pré-inscrição */}
      <section className="section-pad scroll-mt-24 pb-20 sm:pb-28" id="inscricao">
        <div className="container-bsp grid gap-8 overflow-hidden rounded-[2.5rem] bg-sol p-6 text-tinta sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-12">
          <div className="relative text-creme">
            <LogoMark className="pointer-events-none absolute -bottom-12 -left-12 h-64 w-64 text-creme/15" />
            <span className="chip bg-creme text-sol-600">Próxima etapa: sua primeira batida</span>
            <h2 className="font-display relative mt-4 text-5xl sm:text-6xl">Bora fazer Brasília tremer?</h2>
            <p className="relative mt-4 max-w-md text-lg text-creme/90">Deixe seus dados e a coordenação entra em contato para apresentar as turmas, combinar uma aula experimental e explicar os próximos passos.</p>
          </div>
          <div className="rounded-[2rem] bg-creme p-5 sm:p-8">
            <h3 className="font-display text-3xl text-lago">Garanta seu contato para a próxima turma</h3>
            <p className="mt-2 mb-6 text-sm text-tinta/65">A pré-inscrição não exige experiência nem instrumento próprio.</p>
            <OficinaForm />
          </div>
        </div>
      </section>
    </>
  );
}
