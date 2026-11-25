import ArtistLogoImage from "@/components/ArtistLogoImage";

/** Logos originais fornecidas para a faixa de artistas da home. */
export const ARTIST_LOGOS: { name: string; src: string; sizes: string }[] = [
  { name: "Tomate", src: "/brand/artists/01_tomate.png", sizes: "(max-width: 639px) 100px, 124px" },
  { name: "É o Tchan", src: "/brand/artists/02_eo_tchao.png", sizes: "(max-width: 639px) 100px, 124px" },
  { name: "Harmonia do Samba", src: "/brand/artists/03_harmonia_do_samba.png", sizes: "(max-width: 639px) 100px, 124px" },
  // Estes dois logos são mais altos; object-contain reduz a largura real dentro do card.
  { name: "Araketu", src: "/brand/artists/04_are_keto.png", sizes: "(max-width: 639px) 76px, 98px" },
  { name: "Banda Eva", src: "/brand/artists/05_eva.png", sizes: "(max-width: 639px) 85px, 110px" },
  { name: "Molejo", src: "/brand/artists/07_molejo.png", sizes: "(max-width: 639px) 100px, 124px" },
  { name: "Saulo", src: "/brand/artists/08_saulo.png", sizes: "(max-width: 639px) 100px, 124px" },
];

export default function ArtistsMarquee() {
  return (
    <section className="artists-band relative overflow-hidden" aria-labelledby="artists-heading">
      <div className="container-bsp section-pad artists-band__heading">
        <span className="artists-band__rule" aria-hidden="true" />
        <h2 id="artists-heading">Dividindo energias com ícones da música brasileira</h2>
        <span className="artists-band__rule" aria-hidden="true" />
      </div>

      <div
        className="artists-marquee overflow-hidden py-2 sm:py-3"
        role="region"
        aria-label="Logos dos artistas com quem o Bloco Santo Pecado já dividiu o palco"
      >
        <div className="artists-marquee-track flex w-max items-center">
          {[0, 1].map((copy) => (
            <div
              className="flex shrink-0 items-center gap-4 px-2 sm:gap-6 sm:px-3"
              key={copy}
              aria-hidden={copy === 1}
            >
              {ARTIST_LOGOS.map((artist) => (
                <div
                  className="artists-logo-card relative flex h-[66px] w-[142px] shrink-0 items-center justify-center rounded-2xl border px-4 py-2 sm:h-[76px] sm:w-[164px] sm:px-5"
                  key={`${copy}-${artist.name}`}
                >
                  <ArtistLogoImage
                    src={artist.src}
                    alt={copy === 0 ? artist.name : ""}
                    sizes={artist.sizes}
                    loading={copy === 0 ? "eager" : "lazy"}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
