export type GalleryItem = {
  src: string;
  title: string;
  album: "Carnaval" | "Shows" | "Cortejos & orlas" | "Oficina BSP" | "Japão";
  ratio?: "tall" | "wide" | "square";
  alt: string;
};

// Banco de imagens gratuito Pexels. São fotos ilustrativas de cultura/carnaval, não registros oficiais do BSP.
const P = {
  "parade_drummers": "https://images.pexels.com/photos/28538697/pexels-photo-28538697/free-photo-of-energetic-carnival-street-drumming-performance.jpeg?auto=compress&dpr=1&h=1200&w=1800",
  "salvador_drummers": "https://images.pexels.com/photos/29355173/pexels-photo-29355173/free-photo-of-traditional-drummers-performing-in-salvador-street-festival.jpeg?auto=compress&dpr=1&h=1200&w=900",
  "salvador_group": "https://images.pexels.com/photos/29355158/pexels-photo-29355158/free-photo-of-street-drummers-in-traditional-brazilian-attire.jpeg?auto=compress&dpr=1&h=1200&w=900",
  "tambourines": "https://images.pexels.com/photos/2231987/pexels-photo-2231987.jpeg?auto=compress&dpr=1&h=1200&w=1800",
  "women_parade": "https://images.pexels.com/photos/17016463/pexels-photo-17016463.png?cs=srgb&dl=pexels-2mephoto-17016463.jpg&fm=jpg",
  "brasilia_carnival": "https://images.pexels.com/photos/31022399/pexels-photo-31022399.jpeg?cs=srgb&dl=pexels-mendez-692552722-31022399.jpg&fm=jpg",
  "street_crowd": "https://images.pexels.com/photos/20440263/pexels-photo-20440263.jpeg?cs=srgb&dl=pexels-maurylio-silva-251773867-20440263.jpg&fm=jpg",
  "close_drums": "https://images.pexels.com/photos/30757849/pexels-photo-30757849.jpeg?cs=srgb&dl=pexels-ligia-camargo-2055476878-30757849.jpg&fm=jpg"
};

export const GALLERY: GalleryItem[] = [
  { src: P.parade_drummers, title: "Bateria em cortejo", album: "Carnaval", ratio: "wide", alt: "Percussionistas em apresentação de carnaval de rua; fotografia ilustrativa do Pexels." },
  { src: P.brasilia_carnival, title: "Carnaval em Brasília", album: "Carnaval", ratio: "wide", alt: "Pessoas celebrando o carnaval nas ruas de Brasília; fotografia Pexels, não representa evento oficial do BSP." },
  { src: P.salvador_drummers, title: "Percussionistas em apresentação", album: "Shows", ratio: "wide", alt: "Jovens percussionistas em apresentação de rua em Salvador; fotografia ilustrativa do Pexels." },
  { src: P.street_crowd, title: "Festa de rua", album: "Cortejos & orlas", ratio: "wide", alt: "Multidão em cortejo de rua no Brasil; fotografia ilustrativa do Pexels." },
  { src: P.women_parade, title: "Foliãs no cortejo", album: "Carnaval", ratio: "tall", alt: "Mulheres desfilando em um carnaval de rua; fotografia ilustrativa do Pexels." },
  { src: P.salvador_group, title: "Bateria e tradição", album: "Shows", ratio: "wide", alt: "Grupo de percussionistas em trajes tradicionais na rua em Salvador; fotografia ilustrativa do Pexels." },
  { src: P.close_drums, title: "Tambores no cortejo", album: "Cortejos & orlas", ratio: "wide", alt: "Detalhe de percussionistas tocando tambores durante um cortejo; fotografia ilustrativa do Pexels." },
  { src: P.tambourines, title: "Ritmo e tamborins", album: "Oficina BSP", ratio: "wide", alt: "Músicos tocando instrumentos de percussão em desfile de rua; fotografia ilustrativa do Pexels." },
  { src: P.parade_drummers, title: "Percussão na rua", album: "Cortejos & orlas", ratio: "wide", alt: "Percussionistas em apresentação de carnaval; fotografia ilustrativa do Pexels." },
  { src: P.street_crowd, title: "Multidão na rua", album: "Carnaval", ratio: "wide", alt: "Multidão em festa de rua no Brasil; fotografia ilustrativa do Pexels." },
  { src: P.tambourines, title: "Música e movimento", album: "Shows", ratio: "wide", alt: "Pessoas tocando instrumentos de percussão em uma festa; fotografia ilustrativa do Pexels." },
  { src: P.brasilia_carnival, title: "Folia brasiliense", album: "Carnaval", ratio: "wide", alt: "Folia de rua em Brasília; fotografia do Pexels, não representa evento oficial do BSP." },
  { src: P.women_parade, title: "Dança e carnaval", album: "Carnaval", ratio: "tall", alt: "Desfile de carnaval com dançarinas; fotografia ilustrativa do Pexels." },
  { src: P.salvador_group, title: "Encontro de percussionistas", album: "Oficina BSP", ratio: "wide", alt: "Percussionistas reunidos em apresentação de rua em Salvador; fotografia ilustrativa do Pexels." },
];

export type HomeAlbum = {
  album: GalleryItem["album"];
  title: string;
  description: string;
  cover: string;
  coverAlt: string;
};

/** Álbuns em destaque na home. Cada card abre todas as fotos da categoria correspondente. */
export const HOME_ALBUMS: HomeAlbum[] = [
  {
    album: "Carnaval",
    title: "Carnaval de rua",
    description: "A energia da bateria, das fantasias e da folia na rua.",
    cover: P.women_parade,
    coverAlt: "Foliãs em um cortejo de carnaval; imagem ilustrativa.",
  },
  {
    album: "Shows",
    title: "Shows e encontros",
    description: "Apresentações, participações e encontros musicais.",
    cover: P.salvador_drummers,
    coverAlt: "Percussionistas em apresentação; imagem ilustrativa.",
  },
  {
    album: "Cortejos & orlas",
    title: "Cortejos pela cidade",
    description: "A música ocupando as ruas e os espaços de Brasília.",
    cover: P.street_crowd,
    coverAlt: "Público reunido em uma festa de rua; imagem ilustrativa.",
  },
  {
    album: "Oficina BSP",
    title: "Oficina e ensaios",
    description: "Ritmo, instrumentos e momentos de aprendizado.",
    cover: P.tambourines,
    coverAlt: "Instrumentos de percussão em uma apresentação; imagem ilustrativa.",
  },
];

export const ALBUMS = ["Todos", "Carnaval", "Shows", "Cortejos & orlas", "Oficina BSP", "Japão"] as const;

export const VIDEOS = [
  { title: "Cortejo de Carnaval", description: "O bloco na rua: surdos marcando e a cidade inteira dançando.", poster: P.parade_drummers },
  { title: "Ensaio aberto", description: "Bastidores do ensaio, da afinação dos tambores ao repertório.", poster: P.salvador_group },
  { title: "Santo Pecado na Ásia", description: "Registros da turnê internacional do bloco.", poster: P.women_parade },
];
