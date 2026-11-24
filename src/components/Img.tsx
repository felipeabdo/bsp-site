/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

export default function Img({
  src,
  alt,
  className = "",
  style,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
