"use client";

import { useEffect, useMemo, useState } from "react";
import Img from "@/components/Img";
import { GALLERY, HOME_ALBUMS } from "@/lib/gallery";
import type { HomeAlbum } from "@/lib/gallery";

export default function HomeAlbums() {
  const [selectedAlbum, setSelectedAlbum] = useState<HomeAlbum | null>(null);
  const photos = useMemo(
    () => (selectedAlbum ? GALLERY.filter((photo) => photo.album === selectedAlbum.album) : []),
    [selectedAlbum],
  );

  useEffect(() => {
    if (!selectedAlbum) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedAlbum(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedAlbum]);

  return (
    <>
      <div className="home-albums-grid">
        {HOME_ALBUMS.map((album) => {
          const count = GALLERY.filter((photo) => photo.album === album.album).length;
          return (
            <button
              key={album.album}
              type="button"
              className="home-album-card group"
              onClick={() => setSelectedAlbum(album)}
              aria-label={`Abrir o álbum ${album.title}, com ${count} fotos`}
            >
              <span className="home-album-card__media">
                <Img src={album.cover} alt={album.coverAlt} frameClassName="relative block h-full w-full" className="home-album-card__image" />
                <span className="home-album-card__eyebrow">Álbum · {album.album}</span>
                <span className="home-album-card__open">
                  Ver álbum <span aria-hidden="true">↗</span>
                </span>
              </span>
              <span className="home-album-card__body">
                <span className="home-album-card__copy">
                  <span className="home-album-card__title">{album.title}</span>
                  <span className="home-album-card__description">{album.description}</span>
                </span>
                <span className="home-album-card__count">{count} {count === 1 ? "foto" : "fotos"}</span>
              </span>
            </button>
          );
        })}
      </div>

      {selectedAlbum && (
        <div
          className="home-album-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAlbum(null);
          }}
        >
          <section
            className="home-album-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-album-modal-title"
          >
            <header className="home-album-modal__header">
              <div className="min-w-0">
                <span className="home-album-modal__eyebrow">Álbum de evento · {selectedAlbum.album}</span>
                <h3 id="home-album-modal-title" className="home-album-modal__title">{selectedAlbum.title}</h3>
                <p className="home-album-modal__subtitle">
                  {photos.length} {photos.length === 1 ? "registro" : "registros"} neste álbum
                </p>
              </div>
              <button
                type="button"
                className="home-album-modal__close"
                onClick={() => setSelectedAlbum(null)}
                aria-label="Fechar álbum"
              >
                ×
              </button>
            </header>

            <div className="home-album-modal__content">
              <div className="home-album-modal__grid">
                {photos.map((photo, index) => (
                  <figure className="home-album-modal__photo" key={`${photo.src}-${index}`}>
                    <Img src={photo.src} alt={photo.alt} frameClassName="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl" className="home-album-modal__image h-full" />
                    <figcaption>{photo.title}</figcaption>
                  </figure>
                ))}
              </div>
              <p className="home-album-modal__note">
                Imagens ilustrativas temporárias. Este espaço receberá os registros oficiais de cada evento.
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
