import type { ReactNode } from "react";
import { LogoMark, Spiral, Wordmark, SpiralBackdrop } from "@/components/art";

export default function AuthShell({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-sol py-10 sm:py-16">
      <SpiralBackdrop className="pointer-events-none absolute -left-40 -top-40 h-[40rem] w-[45rem] text-lago" />
      <Spiral className="pointer-events-none absolute -bottom-48 -right-32 h-[36rem] w-[36rem] animate-spin-slow text-creme/20" stroke={6} />
      <div className={`container-bsp section-pad relative grid items-center gap-10 ${wide ? "lg:grid-cols-[0.6fr_1.4fr]" : "lg:grid-cols-[1fr_0.9fr]"}`}>
        <div className="hidden text-creme lg:block">
          <LogoMark className="h-28 w-28" wing="#F9F9EA" />
          <Wordmark className="mt-4 h-28 w-44" />
          <p className="mt-6 max-w-sm text-xl font-medium">Cada integrante tem um ID no formato ano-ordem, uma carteirinha e um lugar de destaque na roda.</p>
        </div>
        <div className="mx-auto w-full max-w-3xl rounded-[2.5rem] bg-creme p-6 shadow-2xl sm:p-10">
          <h1 className="font-display text-4xl text-lago sm:text-5xl">{title}</h1>
          <p className="mb-8 mt-2 text-tinta/75">{subtitle}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
