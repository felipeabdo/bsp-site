import Link from "next/link";
import { LogoMark, Marquee, Wordmark, SpiralBackdrop } from "@/components/art";
import { NAV, SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-lago text-creme">
      <div className="bg-sol text-creme">
        <Marquee />
      </div>
      <SpiralBackdrop className="pointer-events-none absolute -right-32 top-40 h-[34rem] w-[38rem] text-creme/10" />
      <div className="container-bsp section-pad relative grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-5">
            <LogoMark className="h-24 w-24 text-sol" />
            <Wordmark className="h-28 w-44 text-creme sm:h-36 sm:w-56" />
          </div>
          <p className="mt-6 max-w-sm text-lg text-creme/85">
            Música de graça para todos desde 2013. Um bloco de amigos de Brasília que leva samba-reggae para as ruas,
            orlas e palcos da cidade.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <h3 className="font-display text-2xl text-sol">Navegue</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="font-medium text-creme/90 hover:text-sol">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/entrar" className="font-medium text-creme/90 hover:text-sol">
                Área do integrante
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-2xl text-sol">Fale com a gente</h3>
          <ul className="mt-4 space-y-3 text-creme/90">
            <li>
              <a href={SITE.instagramUrl} target="_blank" rel="noreferrer" className="font-medium hover:text-sol">
                Instagram · @{SITE.instagram}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="font-medium hover:text-sol">
                {SITE.email}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="font-medium hover:text-sol">
                WhatsApp · {SITE.whatsappLabel}
              </a>
            </li>
            <li className="text-creme/70">{SITE.city}</li>
          </ul>
          <Link href="/contato" className="btn btn-sol mt-6">
            Contratar o bloco
          </Link>
        </div>
      </div>
      <div className="relative border-t border-creme/20">
        <div className="container-bsp section-pad flex flex-col gap-2 py-6 text-sm text-creme/70 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Bloco Santo Pecado · BSB 2013. Todos os direitos reservados.</p>
          <p>Feito em Brasília, com samba-reggae e carinho.</p>
        </div>
      </div>
    </footer>
  );
}
