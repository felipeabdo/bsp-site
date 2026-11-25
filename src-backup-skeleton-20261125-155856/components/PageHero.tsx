import type { ReactNode } from "react";
import { LogoMark, Waves } from "@/components/art";

const TONES = {
  lago: { bg: "bg-lago text-creme", spiral: "text-creme/15", chip: "bg-creme text-lago-700", accent: "text-sol", wave: "text-creme/30" },
  sol: { bg: "bg-sol text-creme", spiral: "text-creme/15", chip: "bg-creme text-sol-600", accent: "text-lago", wave: "text-creme/30" },
  creme: { bg: "bg-areia text-tinta", spiral: "text-sol/40", chip: "bg-sol text-creme", accent: "text-sol", wave: "text-lago/10" },
} as const;

export default function PageHero({
  eyebrow,
  title,
  accent,
  subtitle,
  tone = "lago",
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: string;
  tone?: keyof typeof TONES;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  const t = TONES[tone];

  return (
    <section className={`relative overflow-hidden ${t.bg}`}>
      <LogoMark className={`pointer-events-none absolute -right-32 -top-32 h-[34rem] w-[38rem] ${t.spiral}`} />
      <Waves className={`pointer-events-none absolute -bottom-4 left-0 h-32 w-full ${t.wave}`} />

      <div
        className={`container-bsp section-pad relative ${
          aside
            ? "grid items-center gap-9 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.65fr)] lg:gap-14 lg:py-20"
            : "py-16 sm:py-24"
        }`}
      >
        <div className="relative z-10">
          <span className={`chip ${t.chip}`}>{eyebrow}</span>
          <h1 className="font-display mt-5 max-w-4xl text-[clamp(2.8rem,8vw,6.2rem)] uppercase">
            <span className="tilt">{title}</span>
            {accent && (
              <>
                {" "}
                <span className={`tilt ${t.accent}`}>{accent}</span>
              </>
            )}
          </h1>
          {subtitle && <p className="mt-5 max-w-2xl text-base font-medium opacity-95 sm:text-lg">{subtitle}</p>}
          {children && <div className="mt-7">{children}</div>}
        </div>

        {aside && <div className="relative z-10">{aside}</div>}
      </div>
    </section>
  );
}
