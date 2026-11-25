"use client";

import Image from "next/image";
import { useState } from "react";

export default function ArtistLogoImage({
  src,
  alt,
  sizes,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  sizes: string;
  loading?: "eager" | "lazy";
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative h-full w-full" data-image-state={failed ? "error" : loaded ? "loaded" : "loading"}>
      {!loaded && !failed && <span className="skeleton absolute inset-0 rounded-lg" style={{ position: "absolute", inset: 0, zIndex: 2 }} aria-hidden="true" />}
      {failed && <span className="absolute inset-0 rounded-lg bg-lago/5" aria-hidden="true" />}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
        quality={70}
        sizes={sizes}
        loading={loading}
        onLoad={() => { setLoaded(true); setFailed(false); }}
        onError={() => { setFailed(true); setLoaded(false); }}
      />
    </div>
  );
}
