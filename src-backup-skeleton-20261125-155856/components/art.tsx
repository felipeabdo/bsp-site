import type { CSSProperties } from "react";
import Img from "@/components/Img";

const VECTORS = "/brand/vectors";

/** Aplica uma máscara vetorial extraída do manual original do BSP. */
function brandMask(file: string): CSSProperties {
  const mask = `url("${VECTORS}/${file}")`;
  return {
    backgroundColor: "currentColor",
    maskImage: mask,
    WebkitMaskImage: mask,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: "contain",
    WebkitMaskSize: "contain",
  };
}

/** Grafismo de espiral original da prancha de identidade (não é redesenhado). */
export function Spiral({
  className = "",
  turns: _turns = 3.1,
  stroke: _stroke = 9,
  style,
}: {
  className?: string;
  turns?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`block ${className}`}
      style={{ ...brandMask("swirl-loop-mask.svg"), ...style }}
      aria-hidden="true"
    />
  );
}

/** Espiral ampla de fundo extraída do grafismo principal do manual. */
export function SpiralBackdrop({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block ${className}`}
      style={brandMask("spiral-backdrop-mask.svg")}
      aria-hidden="true"
    />
  );
}

/** Faixa com os quatro arabescos vetoriais originais do manual. */
export function SpiralRow({ className = "", count: _count = 4 }: { className?: string; count?: number }) {
  return (
    <span
      className={`block ${className}`}
      style={brandMask("ornament-row-mask.svg")}
      aria-hidden="true"
    />
  );
}

/** Asas retiradas do símbolo oficial, sem o tridente central. */
export function Waves({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block ${className}`}
      style={brandMask("wings-mask.svg")}
      aria-hidden="true"
    />
  );
}

/** Símbolo oficial: tridente, halo e asas, extraídos em vetor do PDF. */
export function LogoMark({ className = "", wing: _wing }: { className?: string; wing?: string }) {
  return (
    <span
      className={`block shrink-0 ${className}`}
      style={brandMask("symbol-mask.svg")}
      aria-hidden="true"
    />
  );
}

/** Assinatura vertical original Bloco Santo Pecado. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block shrink-0 ${className}`}
      style={brandMask("wordmark-stacked-mask.svg")}
      role="img"
      aria-label="Bloco Santo Pecado"
    />
  );
}

/** Assinatura horizontal original Bloco Santo Pecado. */
export function WordmarkHorizontal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block shrink-0 ${className}`}
      style={brandMask("wordmark-horizontal-mask.svg")}
      role="img"
      aria-label="Bloco Santo Pecado"
    />
  );
}

/** Monograma BSP original. */
export function BspMonogram({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block shrink-0 ${className}`}
      style={brandMask("monogram-bsp-mask.svg")}
      role="img"
      aria-label="BSP"
    />
  );
}

/** Assinatura ilustrada "Eu curto bloco de rua!" extraída do manual. */
export function BrandMotto({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <Img
      src={`${VECTORS}/motto-eu-curto${light ? "-light" : ""}.svg`}
      alt="Eu curto bloco de rua!"
      width={108}
      height={91}
      className={className}
    />
  );
}

/** Selo circular oficial extraído do painel de marcas. */
export function BrandSeal({ className = "" }: { className?: string }) {
  return <Img src={`${VECTORS}/seal-round.svg`} alt="Bloco Santo Pecado de Brasília, desde 2013" className={className} />;
}

/** Selo em escudo original, preservando as cores e os caminhos do PDF. */
export function BrandCrest({ className = "" }: { className?: string }) {
  return <Img src={`${VECTORS}/seal-crest.svg`} alt="Selo oficial em escudo do Bloco Santo Pecado" className={className} />;
}

/** Emblema circular original do tridente e asas. */
export function BrandMedallion({ className = "" }: { className?: string }) {
  return <Img src={`${VECTORS}/seal-starburst.svg`} alt="Emblema circular do Bloco Santo Pecado" className={className} />;
}

/** Selo em estrela original do BSP. */
export function BrandStarburst({ className = "" }: { className?: string }) {
  return <Img src={`${VECTORS}/seal-medallion.svg`} alt="Selo em estrela BSP" className={className} />;
}

/** Assinatura oval original, com textura e lettering preservados. */
export function BrandOvalWordmark({ className = "" }: { className?: string }) {
  return <Img src={`${VECTORS}/wordmark-oval.svg`} alt="Bloco Santo Pecado, assinatura oval" className={className} />;
}

/** Faixa rolando com a assinatura original do bloco. */
export function Marquee({ text = "Eu curto bloco de rua!", className = "" }: { text?: string; className?: string }) {
  const items = Array.from({ length: 8 });
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
      <div className="flex w-max animate-marquee items-center gap-8 py-3">
        {items.concat(items).map((_, i) => (
          <span key={i} className="flex items-center gap-8">
            {text === "Eu curto bloco de rua!" ? (
              <Img
                src={`${VECTORS}/motto-eu-curto-light.min.svg`}
                alt=""
                width={108}
                height={91}
                className="h-12 w-auto sm:h-14"
              />
            ) : (
              <span className="font-display text-3xl uppercase sm:text-4xl">{text}</span>
            )}
            <Spiral className="h-8 w-8 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
