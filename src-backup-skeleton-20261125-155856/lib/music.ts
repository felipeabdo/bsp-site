export type Voice = "surdo" | "dobra" | "martelo" | "repinique" | "timbal" | "caixa" | "guira" | "agogo" | "baixo" | "guitarra" | "metais" | "voz";

export type Instrument = {
  id: Voice;
  name: string;
  family: string;
  role: string;
  detail: string;
  icon: "drum-tall" | "drum-small" | "snare" | "bell" | "shaker" | "guitar" | "horn" | "mic";
  color: "sol" | "lago" | "areia";
  pattern: number[]; // 16 passos: 0 = silêncio, 1 = toque normal, 2 = acento
  sample: boolean;
};

export const BPM_DEFAULT = 92;

export const INSTRUMENTS: Instrument[] = [
  {
    id: "surdo",
    name: "Surdo",
    family: "Percussão · grave",
    role: "O coração do bloco",
    detail:
      "Marca o pulso grave e dá o chão sobre o qual todo o resto dança. É o primeiro instrumento que o corpo da plateia reconhece — o “dum” que faz o peito vibrar.",
    icon: "drum-tall",
    color: "sol",
    pattern: [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0],
    sample: true,
  },
  {
    id: "dobra",
    name: "Dobra",
    family: "Percussão · grave/médio",
    role: "A conversa com o surdo",
    detail:
      "Um surdo mais agudo que “dobra” a marcação, respondendo e preenchendo os espaços deixados pelo surdo grave. Cria o balanço que diferencia o samba-reggae de uma marcação reta.",
    icon: "drum-tall",
    color: "lago",
    pattern: [0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 0, 1],
    sample: true,
  },
  {
    id: "martelo",
    name: "Martelo",
    family: "Percussão · grave seco",
    role: "O ataque e o peso",
    detail:
      "Tambor grave de ataque seco, tocado com baqueta, que ressalta as frases e as convenções do bloco. Dá o “golpe” que abre e fecha as passagens da música.",
    icon: "drum-tall",
    color: "areia",
    pattern: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0],
    sample: true,
  },
  {
    id: "repinique",
    name: "Repinique",
    family: "Percussão · agudo",
    role: "O solista que conduz",
    detail:
      "Tambor agudo tocado com baqueta e mão, faz os desenhos rítmicos mais chamativos, as viradas e os chamados que avisam ao bloco quando mudar. Quem toca repinique conduz a conversa.",
    icon: "drum-small",
    color: "sol",
    pattern: [2, 0, 1, 0, 1, 1, 0, 1, 2, 0, 1, 0, 1, 1, 0, 1],
    sample: true,
  },
  {
    id: "timbal",
    name: "Timbal",
    family: "Percussão · agudo",
    role: "A assinatura baiana",
    detail:
      "Tambor alto e esguio, tocado com as mãos, de som estalado. Popularizado pela Timbalada, traz o brilho e o balanço quebrado que lembram o carnaval de Salvador.",
    icon: "drum-tall",
    color: "lago",
    pattern: [2, 0, 0, 1, 0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 1, 0],
    sample: true,
  },
  {
    id: "caixa",
    name: "Caixa",
    family: "Percussão · esteira",
    role: "O motor contínuo",
    detail:
      "Com a esteira vibrando, mantém o fluxo constante de semicolcheias. É o motor que não deixa a energia cair e costura os instrumentos graves com os agudos.",
    icon: "snare",
    color: "areia",
    pattern: [2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1],
    sample: true,
  },
  {
    id: "guira",
    name: "Guira / Ganzá",
    family: "Percussão · chocalho",
    role: "A textura e o brilho",
    detail:
      "Chocalho raspado ou sacudido que desenha a subdivisão do tempo em alta frequência. É o “brilho” do arranjo, deixando a levada mais leve e dançante.",
    icon: "shaker",
    color: "sol",
    pattern: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    sample: true,
  },
  {
    id: "agogo",
    name: "Agogô e percussão geral",
    family: "Percussão · metal e efeitos",
    role: "Os detalhes que sorriem",
    detail:
      "Sinos metálicos, pandeiros e efeitos coloridos. Funcionam como pontuação: acentuam a clave, abrem espaço para solos e enfeitam as convenções.",
    icon: "bell",
    color: "lago",
    pattern: [2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 1, 0, 2, 0, 0, 0],
    sample: true,
  },
  {
    id: "baixo",
    name: "Baixo",
    family: "Cordas · grave",
    role: "A ponte entre ritmo e harmonia",
    detail:
      "Une a pegada do surdo à harmonia da música. No samba-reggae, herda do reggae a linha de baixo marcada e melódica, que sustenta a canção.",
    icon: "guitar",
    color: "areia",
    pattern: [2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0],
    sample: true,
  },
  {
    id: "guitarra",
    name: "Guitarra",
    family: "Cordas · harmonia",
    role: "O balanço do contratempo",
    detail:
      "Faz as levadas curtas e picadas no contratempo — herança direta do reggae — e os riffs que lembram as guitarras baianas dos trios elétricos.",
    icon: "guitar",
    color: "sol",
    pattern: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    sample: true,
  },
  {
    id: "metais",
    name: "Metais",
    family: "Sopros",
    role: "A fanfarra",
    detail:
      "Saxofone, trompete e trombone fazem os “stabs” e as melodias que cantam por cima da batucada. É o brilho dourado que anuncia o refrão.",
    icon: "horn",
    color: "lago",
    pattern: [2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0],
    sample: true,
  },
  {
    id: "voz",
    name: "Voz",
    family: "Canto",
    role: "Quem puxa a rua",
    detail:
      "A voz conduz o repertório, conversa com o público e dá o grito de guerra. Em um bloco de rua, cantar é tão percussivo quanto bater no tambor.",
    icon: "mic",
    color: "areia",
    pattern: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    sample: false,
  },
];

export const INSPIRATIONS = [
  {
    name: "Olodum",
    place: "Pelourinho · Salvador (BA)",
    year: "1979",
    tag: "Berço do samba-reggae",
    story:
      "Fundado em 1979 no Pelourinho, o Olodum nasceu como bloco afro e, sob a batuta de Mestre Neguinho do Samba, desenvolveu nos anos 1980 o samba-reggae, que mistura ritmos afro-baianos com o balanço do reggae. Ganhou o mundo ao tocar com Paul Simon e ao aparecer no clipe de “They Don’t Care About Us”, de Michael Jackson, gravado no Pelourinho.",
    gives: "A pegada percussiva do repertório e o jeito de transformar tambor em mensagem.",
  },
  {
    name: "Ilê Aiyê",
    place: "Liberdade · Salvador (BA)",
    year: "1974",
    tag: "O primeiro bloco afro",
    story:
      "Criado em 1974 no bairro da Liberdade, em Salvador, é considerado o primeiro bloco afro do Brasil. Nasceu para valorizar a cultura, a estética e a história negras, e até hoje é chamado de “o mais belo dos belos”.",
    gives: "O fundamento: como lembra Xéu, “os fundamentos são as bandas de samba-reggae e o próprio Ilê”.",
  },
  {
    name: "Timbalada",
    place: "Candeal · Salvador (BA)",
    year: "1991",
    tag: "A força do timbal",
    story:
      "Idealizada por Carlinhos Brown no bairro do Candeal, reúne dezenas de timbaleiros pintados com símbolos nos corpos. A Timbalada colocou o timbal no centro do palco e criou uma estética inconfundível de som e de cor.",
    gives: "O timbal, o brilho dos agudos e a alegria visual do cortejo.",
  },
  {
    name: "Chiclete com Banana",
    place: "Salvador (BA)",
    year: "anos 1980",
    tag: "Axé de trio elétrico",
    story:
      "Banda surgida em Salvador no início dos anos 1980, com Bell Marques entre suas vozes mais reconhecidas. É uma das grandes referências do axé e dos trios elétricos, com um repertório que o povo canta de cor.",
    gives: "Os hinos que todo folião sabe cantar e as levadas de guitarra baiana.",
  },
  {
    name: "Jorge Ben Jor",
    place: "Rio de Janeiro (RJ)",
    year: "nascido em 1939",
    tag: "Samba, funk e rock",
    story:
      "Compositor e violonista carioca que fundiu samba, funk, soul e rock num estilo único, em canções como “Mas Que Nada” e “País Tropical”. Seu balanço ensinou o Brasil a gingar sem pedir licença.",
    gives: "O swing do samba misturado ao groove — base para releituras do bloco.",
  },
  {
    name: "Tim Maia",
    place: "Rio de Janeiro (RJ)",
    year: "1942–1998",
    tag: "O Síndico do soul",
    story:
      "Voz inconfundível e pioneiro do soul e do funk brasileiros. Tim Maia colocou metais, groove e emoção em canções que seguem sendo cantadas em qualquer festa.",
    gives: "Os metais, o suingue e o repertório que o bloco reveste de samba-reggae.",
  },
  {
    name: "Bob Marley",
    place: "Jamaica",
    year: "1945–1981",
    tag: "O reggae do mundo",
    story:
      "Ícone do reggae e da música de resistência, Bob Marley espalhou a batida jamaicana pelo planeta. O contratempo e a linha de baixo do reggae estão no DNA do samba-reggae.",
    gives: "O contratempo da guitarra, o baixo marcado e a mensagem de paz.",
  },
  {
    name: "Paralamas do Sucesso",
    place: "Rio de Janeiro (RJ)",
    year: "anos 1980",
    tag: "Rock com reggae e ska",
    story:
      "Banda que misturou rock, reggae, ska e ritmos latinos e popularizou a ginga jamaicana no rock brasileiro. Suas músicas aparecem nos repertórios de bloco como pontes entre o pop e a percussão.",
    gives: "Versões roqueiras na batida do samba-reggae.",
  },
];


export type SynthWaveform = "sine" | "triangle" | "sawtooth" | "square";
export type SoundSlot = {
  id: string;
  name: string;
  pattern: number[];
  source: "synth" | "sample";
  synth: {
    waveform: SynthWaveform;
    pitch: number;
    decay: number;
    filterHz: number;
    noise: number;
  };
  samplePlayback: {
    pitchSemitones: number;
    durationSeconds: number; // 0 = duração original da gravação
  };
};
export type InstrumentComposition = {
  notes: string[]; // pauta superior, clave de sol
  bassNotes: string[]; // pauta inferior, clave de fá
  techniques: ("none" | "slide" | "hammer")[];
  bassTechniques: ("none" | "slide" | "hammer")[];
  chords: string[];
  guitarBase: number[];
};

export const EMPTY_COMPOSITION: InstrumentComposition = {
  notes: Array(16).fill(""),
  bassNotes: Array(16).fill(""),
  techniques: Array(16).fill("none"),
  bassTechniques: Array(16).fill("none"),
  chords: Array(16).fill(""),
  guitarBase: Array(16).fill(0),
};

const SYNTH_DEFAULTS: Record<Voice, SoundSlot["synth"]> = {
  surdo: { waveform: "sine", pitch: 82, decay: 0.62, filterHz: 220, noise: 0 },
  dobra: { waveform: "sine", pitch: 125, decay: 0.4, filterHz: 340, noise: 0 },
  martelo: { waveform: "triangle", pitch: 165, decay: 0.24, filterHz: 1800, noise: 22 },
  repinique: { waveform: "triangle", pitch: 380, decay: 0.18, filterHz: 3400, noise: 32 },
  timbal: { waveform: "sine", pitch: 540, decay: 0.2, filterHz: 2600, noise: 8 },
  caixa: { waveform: "triangle", pitch: 210, decay: 0.12, filterHz: 4200, noise: 76 },
  guira: { waveform: "sawtooth", pitch: 680, decay: 0.09, filterHz: 7200, noise: 100 },
  agogo: { waveform: "sine", pitch: 920, decay: 0.32, filterHz: 5200, noise: 0 },
  baixo: { waveform: "sawtooth", pitch: 55, decay: 0.46, filterHz: 420, noise: 0 },
  guitarra: { waveform: "sawtooth", pitch: 220, decay: 0.18, filterHz: 2500, noise: 0 },
  metais: { waveform: "sawtooth", pitch: 440, decay: 0.34, filterHz: 3200, noise: 4 },
  voz: { waveform: "triangle", pitch: 220, decay: 0.3, filterHz: 2600, noise: 0 },
};

export function createDefaultSoundSlot(instrument: Instrument, index = 0): SoundSlot {
  return {
    id: `sound-${index + 1}`,
    name: index === 0 ? "Base" : `Som ${index + 1}`,
    pattern: index === 0 ? [...instrument.pattern] : Array(16).fill(0),
    source: "synth",
    synth: { ...SYNTH_DEFAULTS[instrument.id] },
    samplePlayback: { pitchSemitones: 0, durationSeconds: 0 },
  };
}

export function normalizeComposition(value: unknown): InstrumentComposition {
  const data = value && typeof value === "object" ? value as Partial<InstrumentComposition> : {};
  const strings = (input: unknown, fallback: string[], maxLength = 12) => Array.isArray(input)
    ? Array.from({ length: 16 }, (_, i) => typeof input[i] === "string" ? input[i].slice(0, maxLength) : "")
    : [...fallback];
  const techniques = (input: unknown) => Array.isArray(input)
    ? Array.from({ length: 16 }, (_, i) => input[i] === "slide" || input[i] === "hammer" ? input[i] as "slide" | "hammer" : "none" as const)
    : Array(16).fill("none" as const);
  return {
    notes: strings(data.notes, EMPTY_COMPOSITION.notes, 12),
    bassNotes: strings(data.bassNotes, EMPTY_COMPOSITION.bassNotes, 12),
    techniques: techniques(data.techniques),
    bassTechniques: techniques(data.bassTechniques),
    chords: strings(data.chords, EMPTY_COMPOSITION.chords, 24),
    guitarBase: Array.isArray(data.guitarBase)
      ? Array.from({ length: 16 }, (_, i) => data.guitarBase?.[i] === 1 || data.guitarBase?.[i] === 2 ? data.guitarBase[i] : 0)
      : [...EMPTY_COMPOSITION.guitarBase],
  };
}

export function normalizeSoundSlots(value: unknown, instrument: Instrument): SoundSlot[] {
  if (!Array.isArray(value)) return instrument.id === "voz" ? [] : [createDefaultSoundSlot(instrument)];
  return value.slice(0, 10).flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Partial<SoundSlot>;
    const synth: Partial<SoundSlot["synth"]> = item.synth && typeof item.synth === "object" ? item.synth : {};
    const samplePlayback: Partial<SoundSlot["samplePlayback"]> = item.samplePlayback && typeof item.samplePlayback === "object" ? item.samplePlayback : {};
    const waveform = synth.waveform === "triangle" || synth.waveform === "sawtooth" || synth.waveform === "square" ? synth.waveform : "sine";
    return [{
      id: typeof item.id === "string" && /^[a-zA-Z0-9_-]{1,32}$/.test(item.id) ? item.id : `sound-${index + 1}`,
      name: typeof item.name === "string" ? item.name.slice(0, 36) : `Som ${index + 1}`,
      pattern: Array.isArray(item.pattern) && item.pattern.length === 16
        ? item.pattern.map((v) => v === 1 || v === 2 ? v : 0)
        : Array(16).fill(0),
      source: item.source === "sample" ? "sample" as const : "synth" as const,
      synth: {
        waveform,
        pitch: typeof synth.pitch === "number" ? Math.min(1800, Math.max(35, synth.pitch)) : SYNTH_DEFAULTS[instrument.id].pitch,
        decay: typeof synth.decay === "number" ? Math.min(2, Math.max(0.04, synth.decay)) : SYNTH_DEFAULTS[instrument.id].decay,
        filterHz: typeof synth.filterHz === "number" ? Math.min(12000, Math.max(80, synth.filterHz)) : SYNTH_DEFAULTS[instrument.id].filterHz,
        noise: typeof synth.noise === "number" ? Math.min(100, Math.max(0, synth.noise)) : SYNTH_DEFAULTS[instrument.id].noise,
      },
      samplePlayback: {
        pitchSemitones: typeof samplePlayback.pitchSemitones === "number" ? Math.min(24, Math.max(-24, samplePlayback.pitchSemitones)) : 0,
        durationSeconds: typeof samplePlayback.durationSeconds === "number" ? Math.min(8, Math.max(0, samplePlayback.durationSeconds)) : 0,
      },
    }];
  });
}
