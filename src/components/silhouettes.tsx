import Img from "@/components/Img";
import { Spiral } from "@/components/art";

/** Contorno de corpo inteiro genérico (masculino / feminino). */
export function BodySilhouette({
  variant = "m",
  className = "",
  title,
}: {
  variant?: string;
  className?: string;
  title?: string;
}) {
  const female = variant === "f";
  return (
    <svg viewBox="0 0 200 420" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <g fill="currentColor">
        {female ? (
          <>
            <path d="M70 54 Q68 12 100 12 Q132 12 130 54 L136 100 Q137 112 126 112 L74 112 Q63 112 64 100 Z" opacity="0.55" />
            <ellipse cx="100" cy="56" rx="25" ry="30" />
            <rect x="90" y="80" width="20" height="30" rx="8" />
            <path d="M72 108 Q100 100 128 108 Q142 114 142 134 L138 200 Q152 250 160 314 L40 314 Q48 250 62 200 L58 134 Q58 114 72 108 Z" />
            <path d="M60 120 Q44 126 42 148 L36 238 Q35 248 44 248 Q53 248 54 238 L60 160 Z" />
            <path d="M140 120 Q156 126 158 148 L164 238 Q165 248 156 248 Q147 248 146 238 L140 160 Z" />
            <rect x="78" y="306" width="19" height="104" rx="9" />
            <rect x="103" y="306" width="19" height="104" rx="9" />
          </>
        ) : (
          <>
            <ellipse cx="100" cy="52" rx="26" ry="31" />
            <path d="M74 30 Q100 6 126 30 Q118 20 100 20 Q82 20 74 30Z" opacity="0.4" />
            <rect x="90" y="80" width="20" height="22" rx="8" />
            <path d="M62 102 Q100 92 138 102 Q160 108 162 134 L168 232 Q169 246 156 246 Q145 246 144 232 L138 162 L139 252 L142 402 Q142 412 131 412 L108 412 Q100 412 100 402 L100 272 L100 402 Q100 412 92 412 L69 412 Q58 412 58 402 L61 252 L62 162 L56 232 Q55 246 44 246 Q31 246 32 232 L38 134 Q40 108 62 102 Z" />
          </>
        )}
      </g>
    </svg>
  );
}


/** Silhueta de corpo inteiro de percussionista tocando surdo elevado. */
export function DrummerSilhouette({
  variant = "m",
  className = "",
  title,
}: {
  variant?: string;
  className?: string;
  title?: string;
}) {
  const file = variant === "f" ? "surdo-f.svg" : "surdo-m.svg";
  const mask = `url("/brand/silhouettes/${file}")`;
  return (
    <span
      className={`block shrink-0 ${className}`}
      style={{
        backgroundColor: "currentColor",
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center bottom",
        WebkitMaskPosition: "center bottom",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}

/** Contorno de busto 3x4 genérico. */
export function PortraitSilhouette({ variant = "m", className = "" }: { variant?: string; className?: string }) {
  const female = variant === "f";
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden="true" preserveAspectRatio="xMidYMax slice">
      <g fill="currentColor">
        {female && <path d="M32 62 Q30 14 60 14 Q90 14 88 62 L92 112 Q92 124 80 124 L40 124 Q28 124 28 112 Z" opacity="0.55" />}
        <ellipse cx="60" cy="62" rx="24" ry="29" />
        {!female && <path d="M37 50 Q60 22 83 50 Q74 38 60 38 Q46 38 37 50Z" opacity="0.4" />}
        <rect x="50" y="86" width="20" height="24" rx="8" />
        <path d="M6 168 Q8 114 44 106 Q60 112 76 106 Q112 114 114 168 Z" />
      </g>
    </svg>
  );
}

/** Placeholder genérico para fotos de eventos. */
export function PhotoPlaceholder({ label = "Foto em breve", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden bg-lago-100 text-lago ${className}`}>
      <Spiral className="absolute -right-6 -top-6 h-28 w-28 opacity-30" stroke={8} />
      <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="12" width="40" height="28" rx="6" />
        <circle cx="24" cy="26" r="7" />
        <path d="M16 12l3-5h10l3 5" />
      </svg>
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

/** Foto do integrante (ou silhueta, quando não houver foto). */
export function MemberImage({
  member,
  kind,
  className = "",
  fit,
  silClass = "text-lago/70",
}: {
  member: {
    memberId: string;
    silhouette: string;
    hasBody: boolean;
    hasPortrait: boolean;
    photoVersion: number;
    bodyPhotoType: string;
  };
  kind: "body" | "portrait";
  className?: string;
  fit?: "cover" | "contain";
  silClass?: string;
}) {
  const has = kind === "body" ? member.hasBody : member.hasPortrait;
  const resolvedFit = fit ?? (kind === "body" && member.bodyPhotoType === "cutout" ? "contain" : "cover");
  if (has) {
    const pos = kind === "body" && member.bodyPhotoType === "half" ? "object-top" : kind === "body" && member.bodyPhotoType === "cutout" ? "object-bottom" : "object-center";
    return (
      <Img
        src={`/api/photo/${member.memberId}/${kind}?v=${member.photoVersion}`}
        alt=""
        frameClassName="bsp-member-image-frame relative block h-full w-full overflow-visible"
        className={`${className} ${resolvedFit === "cover" ? "object-cover" : "object-contain"} ${pos}`}
      />
    );
  }
  return kind === "body" ? (
    <DrummerSilhouette variant={member.silhouette} className={`${className} ${silClass}`} />
  ) : (
    <PortraitSilhouette variant={member.silhouette} className={`${className} ${silClass}`} />
  );
}
