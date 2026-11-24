# BSP site - implementation update

## Implemented in this continuation

- Reworked the homepage hero into a full-bleed, near-full-viewport section below the existing header.
- Used the official horizontal/stacked wordmark assets extracted from the BSP 2026 identity manual.
- Kept the original `symbol-mask.svg` as the source for the trident/halo/wings mark. In the new hero, its wrapper keeps the source aspect ratio (266:220) and remains fully inside the hero rather than being pushed outside the viewport.
- Replaced the homepage's old blue “Eu curto bloco de rua!” strip with a new section titled “Dividindo energias com ícones da música brasileira”. The footer continues to use the old marquee, unchanged.
- Added an artists-logo ticker component. It is intentionally waiting for BSP-confirmed artists and official logo files; no artist names or participations were guessed.
- Added two original, scalable SVG body silhouettes showing percussionists with raised surdos. Member cards and the body-sized spotlight use these. The small gender selector in signup and the 3x4 portrait fallback keep their previous silhouettes.

## Files changed / added

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/ArtistsMarquee.tsx` (new)
- `src/components/silhouettes.tsx`
- `public/brand/silhouettes/surdo-m.svg` (new)
- `public/brand/silhouettes/surdo-f.svg` (new)
- `.gitignore` (new)

## Still needed from BSP

1. Confirmed list of artists with whom the block has performed.
2. Official logo files for those artists, preferably SVG or transparent PNG. A ZIP with one file per artist is ideal. If files are unavailable, provide the confirmed names plus official website/press-kit URLs.
3. Desktop and mobile screenshots of `https://bloquinho.artthi.studio`, especially the hero and the artist-logo ticker, because the reference site could not be loaded by the available web viewer.

## Validation and environment notes

- The identity manual was reviewed; the palette and the official trident/halo/wings mark were checked against the rendered PDF page.
- The three modified TSX files passed TypeScript transpilation/syntax parsing; both new SVG files passed XML parsing.
- A full lint, typecheck and production build could not be run in this container because project dependencies were not present and package installation timed out; the offline npm cache did not contain all locked packages.
- The archive intentionally excludes `.env.local`, `.next/` and `node_modules/`. Keep the existing local `.env.local` (especially `DATABASE_URL`) and copy it into the extracted project before running locally. Do not upload credentials.
