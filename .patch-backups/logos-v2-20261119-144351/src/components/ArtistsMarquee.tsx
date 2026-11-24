import Image from "next/image";

/** Logos enviados para a faixa de artistas da home. */
export const ARTIST_LOGOS: { name: string; src: string }[] = [
  { name: "Tomate", src: "/brand/artists/tomate.png" },
  { name: "É o Tchan", src: "/brand/artists/eo-tchan.jpg" },
  { name: "Harmonia do Samba", src: "/brand/artists/harmonia-do-samba.jpg" },
  { name: "Banda Eva", src: "/brand/artists/banda-eva.png" },
  { name: "Aro Ketu", src: "/brand/artists/araketu.jpg" },
  { name: "Daniela Mercury", src: "/brand/artists/daniela-mercury.png" },
  { name: "Molejo", src: "/brand/artists/molejo.png" },
  { name: "Saulo", src: "/brand/artists/saulo.png" },
];

export default function ArtistsMarquee() {
  return (
    <section className="artists-band relative overflow-hidden bg-[#f3f4f6] py-6 text-lago sm:py-7" aria-labelledby="artists-heading">
      <div className="container-bsp section-pad">
        <div className="mb-4 flex items-center justify-center gap-4 sm:mb-5">
          <span className="h-px flex-1 max-w-24 bg-sol" aria-hidden="true" />
          <h2 id="artists-heading" className="font-display text-center text-[clamp(1.05rem,2.5vw,1.8rem)] uppercase leading-tight">
            Dividindo energias com ícones da música brasileira
          </h2>
          <span className="h-px flex-1 max-w-24 bg-sol" aria-hidden="true" />
        </div>
      </div>

      <div
        "artists-marquee bg-[#d0d0d0]! overflow-hidden py-1.5 sm:py-2"
        role="region"
        aria-label="Logos dos artistas com quem o Bloco Santo Pecado já dividiu o palco"
      >
        <div className="flex w-max artists-marquee-track items-center">
          {[0, 1].map((copy) => (
            <div
              className="flex shrink-0 items-center gap-8 px-5 sm:gap-12 sm:px-7"
              key={copy}
              aria-hidden={copy === 1}
            >
              {ARTIST_LOGOS.map((artist) => (
                <div className="relative h-8 w-24 shrink-0 sm:h-10 sm:w-32" key={`${copy}-${artist.name}`}>
                  <Image
                    src={artist.src}
                    alt={copy === 0 ? artist.name : ""}
                    fill
                    className="object-contain"
                    sizes="128px"
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
