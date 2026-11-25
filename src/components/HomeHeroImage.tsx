/* eslint-disable @next/next/no-img-element */

export const HERO_SIZES = "(max-width: 520px) min(285px, calc(72vw - 1.66rem)), (max-width: 900px) 315px, 455px";

export const HERO_AVIF_SRCSET = [
  "/brand/photos/home-hero-complete-320.avif 320w",
  "/brand/photos/home-hero-complete-400.avif 400w",
  "/brand/photos/home-hero-complete-480.avif 480w",
  "/brand/photos/home-hero-complete-768.avif 768w",
  "/brand/photos/home-hero-complete-960.avif 960w",
  "/brand/photos/home-hero-complete-1344.avif 1344w",
].join(", ");

const HERO_WEBP_SRCSET = [
  "/brand/photos/home-hero-complete-320.webp 320w",
  "/brand/photos/home-hero-complete-400.webp 400w",
  "/brand/photos/home-hero-complete-480.webp 480w",
  "/brand/photos/home-hero-complete-768.webp 768w",
  "/brand/photos/home-hero-complete-960.webp 960w",
  "/brand/photos/home-hero-complete-1344.webp 1344w",
].join(", ");

const HERO_PNG_SRCSET = [
  "/brand/photos/home-hero-complete-320.png 320w",
  "/brand/photos/home-hero-complete-400.png 400w",
  "/brand/photos/home-hero-complete-768.png 768w",
  "/brand/photos/home-hero-complete.png 1344w",
].join(", ");

export default function HomeHeroImage() {
  return (
    <picture className="block w-full">
      <source type="image/avif" srcSet={HERO_AVIF_SRCSET} sizes={HERO_SIZES} />
      <source type="image/webp" srcSet={HERO_WEBP_SRCSET} sizes={HERO_SIZES} />
      <img
        src="/brand/photos/home-hero-complete-400.png"
        srcSet={HERO_PNG_SRCSET}
        sizes={HERO_SIZES}
        alt="Integrantes do Bloco Santo Pecado reunidos em fotografia de grupo"
        width={1344}
        height={1821}
        className="home-hero__complete"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}
