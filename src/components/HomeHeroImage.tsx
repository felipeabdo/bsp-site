import HomeHeroImageClient from "@/components/HomeHeroImageClient";

export const HERO_SIZES = "(max-width: 520px) min(285px, calc(72vw - 1.66rem)), (max-width: 900px) 315px, 455px";

export const HERO_AVIF_SRCSET = [
  "/brand/photos/home-hero-complete-320.avif 320w",
  "/brand/photos/home-hero-complete-400.avif 400w",
  "/brand/photos/home-hero-complete-480.avif 480w",
  "/brand/photos/home-hero-complete-576.avif 576w",
  "/brand/photos/home-hero-complete-768.avif 768w",
  "/brand/photos/home-hero-complete-960.avif 960w",
  "/brand/photos/home-hero-complete-1344.avif 1344w",
].join(", ");

const HERO_WEBP_SRCSET = [
  "/brand/photos/home-hero-complete-320.webp 320w",
  "/brand/photos/home-hero-complete-400.webp 400w",
  "/brand/photos/home-hero-complete-480.webp 480w",
  "/brand/photos/home-hero-complete-576.webp 576w",
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
    <HomeHeroImageClient
      sizes={HERO_SIZES}
      avifSrcSet={HERO_AVIF_SRCSET}
      webpSrcSet={HERO_WEBP_SRCSET}
      pngSrcSet={HERO_PNG_SRCSET}
    />
  );
}
