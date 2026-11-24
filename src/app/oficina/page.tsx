import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark, Spiral, Waves } from "@/components/art";
import { CopyButton, OficinaForm } from "@/components/Forms";
import { MemberImage } from "@/components/silhouettes";
import { getMember } from "@/lib/members";
import { OFICINA, SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Oficina BSP" };
export const dynamic = "force-dynamic";

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const STEPS = [
  ["Pré-inscrição", "Preencha o formulário abaixo com seus dados e o instrumento que quer aprender."],
  ["Conversa e aula experimental", "A coordenação chama você no WhatsApp para combinar turma, horário e uma primeira vivência."],
  ["Matrícula e primeira mensalidade", "Pague pelo Pix (ou outro meio combinado) e envie o comprovante."],
  ["Entre para a roda", "Receba seu instrumento, ritmo e, no futuro, o convite para sair no cortejo com o bloco."],
];

export default async function OficinaPage() {
  const mestre = await getMember("2013-003");

  return (
    <>
      {/* HERO com o mestre */}
      <section className="relative overflow-hidden bg-lago text-creme">
        <LogoMark className="pointer-events-none absolute -left-40 -top-32 h-[40rem] w-[45rem] text-creme/12" />
        <Waves className="pointer-events-none absolute -bottom-6 left-0 h-40 w-full text-creme/30" />
        <div className="container-bsp section-pad relative grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="order-2 lg:order-1">
            <span className="chip bg-sol text-creme">Oficina BSP</span>
            <h1 className="font-display mt-5 text-[clamp(3.2rem,9vw,7rem)] uppercase">
              <span className="tilt">Oficina</span> <span className="tilt text-sol">BSP</span>
            </h1>
            <p className="mt-4 text-xl font-medium sm:text-2xl">
              Aprenda samba-reggae com quem comanda a bateria do Bloco Santo Pecado.
            </p>
            <div className="mt-6 rounded-3xl bg-creme/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-widest text-sol">Com o mestre</p>
              <p className="font-display text-4xl sm:text-5xl">Reinaldo Bráz</p>
              <p className="mt-2 text-creme/90">
                Mestre do Bloco Santo Pecado, conduz a bateria, cria os arranjos e ensina a linguagem do
                samba-reggae a quem nunca tocou — e a quem já toca.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#inscricao" className="btn btn-sol">Quero participar</a>
              <a href="#valores" className="btn btn-creme">Ver valores e pagamento</a>
            </div>
          </div>

          <div className="relative order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-md">
            <div className="absolute inset-x-4 top-8 aspect-square animate-spin-slow rounded-full border-[28px] border-sol/80" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2.5rem] border-8 border-creme bg-areia text-lago shadow-2xl">
              {mestre ? (
                <div className="flex h-full w-full items-end justify-center px-4 pt-10">
                  <MemberImage member={mestre} kind="body" className="h-full w-full" />
                </div>
              ) : null}
            </div>
            <span className="absolute -left-3 bottom-16 -rotate-6 rounded-2xl bg-sol px-4 py-2 font-display text-xl uppercase shadow-xl">Mestre Reinaldo Bráz</span>
            <LogoMark className="absolute -right-4 top-2 h-20 w-20 rotate-6 text-creme" wing="#F9834E" />
          </div>
        </div>
      </section>

      {/* O que é */}
      <section className="section-pad py-20 sm:py-24">
        <div className="container-bsp">
          <span className="chip bg-sol-100 text-sol-600">Para quem é</span>
          <h2 className="font-display mt-4 max-w-3xl text-5xl text-lago sm:text-6xl">Ninguém começa sabendo — o Santo Pecado também não.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["Sem experiência", "A maioria dos fundadores nunca tinha tocado. A oficina parte do zero e respeita o tempo de cada pessoa.", "bg-sol text-creme"],
              ["Instrumentos reais", "Surdo, dobra, repinique, timbal, caixa, guira e percussão geral — e como eles conversam no samba-reggae.", "bg-lago text-creme"],
              ["Prática de bloco", "Aulas pensadas para a roda: repertório do bloco, convenções, escuta e postura de bateria.", "bg-areia text-tinta"],
            ].map(([t, d, c]) => (
              <div key={t} className={`${c} rounded-[2rem] p-7`}>
                <h3 className="font-display text-3xl">{t}</h3>
                <p className="mt-3 leading-relaxed opacity-95">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como participar */}
      <section className="section-pad bg-areia/70 py-20 sm:py-24" id="como-participar">
        <div className="container-bsp">
          <span className="chip bg-lago text-creme">Como participar</span>
          <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Quatro passos até a roda</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="relative rounded-[2rem] bg-white p-7 ring-1 ring-tinta/5">
                <span className="font-display text-6xl text-sol">{i + 1}</span>
                <h3 className="font-display mt-2 text-2xl">{t}</h3>
                <p className="mt-2 text-tinta/75">{d}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-2xl bg-white p-4 text-sm font-medium text-tinta/80">{OFICINA.schedule}.</p>
        </div>
      </section>

      {/* Valores e pagamento */}
      <section className="section-pad scroll-mt-24 py-20 sm:py-28" id="valores">
        <div className="container-bsp">
          <span className="chip bg-sol-100 text-sol-600">Investimento</span>
          <h2 className="font-display mt-4 text-5xl text-lago sm:text-6xl">Valores e formas de pagamento</h2>
          {!OFICINA.valuesConfirmed && (
            <p className="mt-4 inline-block rounded-2xl bg-sol-100 px-4 py-2 text-sm font-semibold text-sol-600">
              Valores ilustrativos — confirme com a coordenação antes de pagar.
            </p>
          )}

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-3">
              {[
                ["Matrícula", brl(OFICINA.matricula), "pagamento único", "bg-areia text-tinta"],
                ["Mensalidade", brl(OFICINA.mensalidade), "por mês", "bg-lago text-creme"],
                ["Mensalidade à vista", brl(OFICINA.mensalidadeAvista), "por mês, no plano trimestral", "bg-sol text-creme"],
              ].map(([t, v, s, c]) => (
                <div key={t} className={`${c} flex flex-col justify-between rounded-[2rem] p-6`}>
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">{t}</h3>
                  <p className="font-display mt-6 text-5xl">{v}</p>
                  <p className="mt-1 text-sm font-semibold opacity-80">{s}</p>
                </div>
              ))}
              <div className="rounded-[2rem] bg-white p-6 ring-1 ring-tinta/5 sm:col-span-3">
                <h3 className="font-display text-2xl text-lago">Como pagar</h3>
                <ul className="mt-3 grid gap-3 text-tinta/85 sm:grid-cols-3">
                  <li className="rounded-2xl bg-areia p-4"><strong>Pix</strong><br />Forma mais rápida. Envie o comprovante pelo WhatsApp.</li>
                  <li className="rounded-2xl bg-areia p-4"><strong>Transferência</strong><br />TED/DOC com os mesmos dados do Pix.</li>
                  <li className="rounded-2xl bg-areia p-4"><strong>Presencial</strong><br />Dinheiro ou cartão na aula, combinando com a coordenação.</li>
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-tinta p-7 text-creme">
              <Spiral className="absolute -right-12 -top-12 h-48 w-48 text-lago-700" stroke={8} />
              <p className="relative text-sm font-bold uppercase tracking-widest text-sol">Pagamento por Pix</p>
              <p className="font-display relative mt-3 break-all text-2xl sm:text-3xl">{OFICINA.pixKey}</p>
              <p className="relative mt-2 text-creme/80">Favorecido: {OFICINA.pixHolder}</p>
              <div className="relative mt-6 flex flex-wrap gap-3">
                <CopyButton text={OFICINA.pixKey} />
                <a className="btn btn-creme" href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Olá! Fiz o pagamento da Oficina BSP, segue o comprovante.")}`} target="_blank" rel="noreferrer">
                  Enviar comprovante
                </a>
              </div>
              <p className="relative mt-5 text-sm text-creme/70">Identifique o Pix com seu nome completo e “Oficina BSP”.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inscrição */}
      <section className="section-pad scroll-mt-24 pb-24" id="inscricao">
        <div className="container-bsp grid gap-10 rounded-[2.5rem] bg-sol p-6 text-tinta sm:p-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="text-creme">
            <span className="chip bg-creme text-sol-600">Vagas abertas o ano todo</span>
            <h2 className="font-display mt-4 text-5xl sm:text-6xl">Bora tocar?</h2>
            <p className="mt-4 text-lg">
              Deixe seus dados e a coordenação chama você no WhatsApp. Já é integrante do bloco?{" "}
              <Link href="/entrar" className="font-bold underline">Entre na sua conta</Link>.
            </p>
          </div>
          <div className="rounded-[2rem] bg-creme p-6 sm:p-8">
            <OficinaForm />
          </div>
        </div>
      </section>
    </>
  );
}
