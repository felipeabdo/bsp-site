/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";

export default function Img({
  src,
  alt,
  className = "",
  style,
  priority = false,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
