import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import "./globals.css";
import HeaderSlot from "@/components/HeaderSlot";
import FooterSlot from "@/components/FooterSlot";

export const metadata: Metadata = {
  title: {
    default: "Bloco Santo Pecado · Eu curto bloco de rua!",
    template: "%s · Bloco Santo Pecado",
  },
  description:
    "Bloco Santo Pecado de Brasília: samba-reggae nas ruas desde 2013. Conheça a história, os integrantes, a Oficina BSP e os próximos eventos.",
};

export const viewport: Viewport = {
  themeColor: "#F9834E",
  width: "device-width",
  initialScale: 1,
};

function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-40 flex h-[4.5rem] items-center sm:h-20 justify-between bg-creme px-5 shadow-sm sm:px-8" aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="skeleton h-8 w-20 rounded-md" />
      </div>
      <div className="hidden items-center gap-3 xl:flex">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-8 w-16 rounded-full" />)}
      </div>
      <div className="skeleton h-10 w-10 rounded-full xl:hidden" />
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/fonts/bagel-fat-one-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/nunito-latin-600-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Suspense fallback={<HeaderSkeleton />}><HeaderSlot /></Suspense>
        <main>{children}</main>
        <Suspense fallback={null}><FooterSlot /></Suspense>
      </body>
    </html>
  );
}
