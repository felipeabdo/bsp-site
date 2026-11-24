import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { ContactForm } from "@/components/Forms";
import { Spiral } from "@/components/art";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contato" };

export default function ContatoPage() {
  const channels = [
    { t: "Instagram", v: `@${SITE.instagram}`, h: SITE.instagramUrl, c: "bg-sol text-creme" },
    { t: "WhatsApp", v: SITE.whatsappLabel, h: `https://wa.me/${SITE.whatsapp}`, c: "bg-lago text-creme" },
    { t: "E-mail", v: SITE.email, h: `mailto:${SITE.email}`, c: "bg-areia text-tinta" },
  ];
  return (
    <>
      <PageHero
        tone="lago"
        eyebrow="Fale com a gente"
        title="Bora"
        accent="conversar?"
        subtitle="Quer o Santo Pecado no seu evento, na sua festa ou na sua empresa? Quer fazer parte? Mande uma mensagem."
      />
      <section className="section-pad py-16 sm:py-24">
        <div className="container-bsp grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            {channels.map((c) => (
              <a key={c.t} href={c.h} target="_blank" rel="noreferrer" className={`${c.c} group relative block overflow-hidden rounded-[2rem] p-6 transition hover:-translate-y-1`}>
                <Spiral className="absolute -right-8 -top-8 h-32 w-32 opacity-20 transition duration-700 group-hover:rotate-90" stroke={8} />
                <p className="relative text-sm font-bold uppercase tracking-widest opacity-80">{c.t}</p>
                <p className="font-display relative mt-1 break-all text-2xl sm:text-3xl">{c.v}</p>
              </a>
            ))}
            <div className="rounded-[2rem] bg-white p-6 ring-1 ring-tinta/5">
              <p className="text-sm font-bold uppercase tracking-widest text-sol-600">Onde estamos</p>
              <p className="font-display mt-1 text-2xl">{SITE.city}</p>
              <p className="mt-2 text-tinta/75">Atendemos eventos corporativos, festas, pré-carnavais e cortejos durante todo o ano.</p>
            </div>
          </div>
          <div className="rounded-[2.5rem] bg-areia p-6 sm:p-10">
            <h2 className="font-display text-4xl text-lago">Envie sua mensagem</h2>
            <div className="mt-6"><ContactForm /></div>
          </div>
        </div>
      </section>
    </>
  );
}
