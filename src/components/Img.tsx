"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Imagem com espaço reservado estável e skeleton enquanto o navegador baixa
 * e decodifica o arquivo. O wrapper recebe as classes de layout em
 * `frameClassName`; `className` continua sendo aplicado à imagem.
 */
export default function Img({
  src,
  alt,
  className = "",
  frameClassName = "",
  style,
  frameStyle,
  priority = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  frameClassName?: string;
  style?: CSSProperties;
  frameStyle?: CSSProperties;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const state = failedSrc === src ? "error" : loadedSrc === src ? "loaded" : "loading";

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;

    if (image.naturalWidth > 0) {
      setLoadedSrc(src);
      setFailedSrc(null);
    } else {
      setFailedSrc(src);
      setLoadedSrc(null);
    }
  }, [src]);

  return (
    <span
      className={`bsp-image-frame ${frameClassName}`}
      style={frameStyle}
      data-image-state={state}
    >
      {state === "loading" && (
        <span className="skeleton bsp-image-frame__skeleton" aria-hidden="true" />
      )}
      {state === "error" && (
        <span
          className="bsp-image-frame__fallback"
          role={alt ? "img" : undefined}
          aria-label={alt || undefined}
          aria-hidden={alt ? undefined : true}
        >
          {alt ? "Imagem temporariamente indisponível" : ""}
        </span>
      )}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`bsp-image-frame__image ${className}`}
        style={style}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => {
          setLoadedSrc(src);
          setFailedSrc(null);
        }}
        onError={() => {
          setFailedSrc(src);
          setLoadedSrc(null);
        }}
      />
    </span>
  );
}
