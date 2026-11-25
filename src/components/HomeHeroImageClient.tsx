"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  sizes: string;
  avifSrcSet: string;
  webpSrcSet: string;
  pngSrcSet: string;
};

export default function HomeHeroImageClient({ sizes, avifSrcSet, webpSrcSet, pngSrcSet }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete) {
      setLoaded(image.naturalWidth > 0);
      setFailed(image.naturalWidth === 0);
    }
  }, []);

  return (
    <div className="home-hero-image-frame" data-image-state={failed ? "error" : loaded ? "loaded" : "loading"}>
      {!loaded && !failed && <span className="skeleton home-hero-image-frame__skeleton" aria-hidden="true" />}
      {failed && <span className="home-hero-image-frame__fallback" aria-hidden="true" />}
      <picture className="home-hero-image-frame__picture">
        <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        <img
          ref={imageRef}
          src="/brand/photos/home-hero-complete-400.png"
          srcSet={pngSrcSet}
          sizes={sizes}
          alt="Integrantes do Bloco Santo Pecado reunidos em fotografia de grupo"
          width={1344}
          height={1821}
          className="home-hero__complete"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => { setLoaded(true); setFailed(false); }}
          onError={() => { setFailed(true); setLoaded(false); }}
        />
      </picture>
    </div>
  );
}
