"use client";

import { useEffect, useMemo, useState } from "react";
import { PhotoPlaceholder } from "@/components/silhouettes";
import Img from "@/components/Img";
import { ALBUMS, GALLERY } from "@/lib/gallery";

export default function GalleryClient() {
  const [album, setAlbum] = useState<(typeof ALBUMS)[number]>("Todos");
  const [open, setOpen] = useState<number | null>(null);
  const items = useMemo(() => (album === "Todos" ? GALLERY : GALLERY.filter((g) => g.album === album)), [album]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % items.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + items.length) % items.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, items.length]);

  const current = open !== null ? items[open] : null;

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {ALBUMS.map((a) => (
          <button
            key={a}
            onClick={() => setAlbum(a)}
            className={`shrink-0 rounded-full px-5 py-2.5 font-semibold transition ${
              album === a ? "bg-sol text-creme shadow-[0_5px_0_var(--color-sol-600)]" : "bg-white ring-1 ring-tinta/10 hover:bg-sol-100"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Palco", "Ensaio", "Bastidores", "Encontros"].map((l) => (
            <PhotoPlaceholder key={l} label={`${album} · ${l}`} className="aspect-[4/5] rounded-3xl" />
          ))}
          <p className="sm:col-span-2 lg:col-span-4 rounded-2xl bg-areia p-4 text-sm font-medium">
            As fotos deste álbum ainda não foram enviadas. Mande para o bloco pela página de contato!
          </p>
        </div>
      ) : (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((g, i) => (
            <button
              key={`${g.src}-${i}`}
              onClick={() => setOpen(i)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-3xl bg-lago text-left"
            >
              <Img
                src={g.src}
                alt={g.alt}
                frameClassName={`relative block w-full overflow-hidden ${g.ratio === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"}`}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-tinta/85 to-transparent p-4 pt-12 text-creme">
                <span className="font-display text-xl leading-tight">{g.title}</span>
                <span className="chip bg-sol text-creme">{g.album}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="fixed inset-0 z-50 flex animate-fade flex-col bg-tinta/95 p-4 text-creme" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl sm:text-2xl">{current.title} <span className="text-sol">· {current.album}</span></p>
            <button onClick={() => setOpen(null)} className="grid h-11 w-11 place-items-center rounded-full bg-creme text-tinta" aria-label="Fechar">✕</button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
            <Img
              src={current.src}
              alt={current.alt}
              frameClassName="relative grid max-h-full max-w-full place-items-center"
              className="max-h-full max-w-full rounded-3xl object-contain"
            />
            <button onClick={() => setOpen((open! - 1 + items.length) % items.length)} className="absolute left-0 grid h-12 w-12 place-items-center rounded-full bg-sol text-2xl" aria-label="Anterior">‹</button>
            <button onClick={() => setOpen((open! + 1) % items.length)} className="absolute right-0 grid h-12 w-12 place-items-center rounded-full bg-sol text-2xl" aria-label="Próxima">›</button>
          </div>
          <p className="text-center text-sm text-creme/70">{open! + 1} / {items.length} · imagem temporária</p>
        </div>
      )}
    </div>
  );
}
