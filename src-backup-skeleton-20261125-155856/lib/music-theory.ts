/** Lead-sheet chord and note helpers shared by public and private playback. */
const NATURAL_PITCH: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function pitchClass(note: string): number | null {
  const match = /^([A-G])([#b]{0,2})$/i.exec(note.trim().replaceAll("♯", "#").replaceAll("♭", "b"));
  if (!match) return null;
  const alteration = [...match[2]].reduce((sum, accidental) => sum + (accidental === "#" ? 1 : -1), 0);
  return ((NATURAL_PITCH[match[1].toUpperCase()] + alteration) % 12 + 12) % 12;
}

export function noteToMidi(note: string): number | null {
  const match = /^([A-G])([#b]{0,2})(-?\d{1,2})$/i.exec(note.trim().replaceAll("♯", "#").replaceAll("♭", "b"));
  if (!match) return null;
  const pc = pitchClass(`${match[1]}${match[2]}`);
  return pc === null ? null : (Number(match[3]) + 1) * 12 + pc;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Returns MIDI note numbers (including slash bass), or null for an invalid/unsupported chord symbol. */
export function chordToMidiNotes(symbol: string, octave = 3): number[] | null {
  const input = symbol.trim().replaceAll("♯", "#").replaceAll("♭", "b").replaceAll("Δ", "maj").replaceAll("°", "dim").replaceAll("ø", "m7b5");
  if (!input) return null;

  let chordPart = input;
  let slashBass: string | null = null;
  const slash = /\/([A-Ga-g][#b]{0,2})$/.exec(input);
  if (slash) {
    slashBass = slash[1];
    chordPart = input.slice(0, slash.index);
  }
  const rootMatch = /^([A-Ga-g])([#b]{0,2})(.*)$/.exec(chordPart);
  if (!rootMatch) return null;
  const rootPc = pitchClass(`${rootMatch[1]}${rootMatch[2]}`);
  if (rootPc === null) return null;
  const rootMidi = (octave + 1) * 12 + rootPc;
  const rawSuffix = rootMatch[3].replace(/[()\s,]/g, "");
  let suffix = rawSuffix.toLowerCase();
  let quality: "major" | "minor" | "diminished" | "half-diminished" | "augmented" | "sus2" | "sus4" | "minor-major" = "major";
  let extension = 0;
  let majorSeventh = false;

  if (suffix.startsWith("m7b5") || suffix.startsWith("min7b5")) {
    quality = "half-diminished";
    suffix = suffix.replace(/^m(?:in)?7b5/, "");
  } else if (suffix.startsWith("mmaj") || suffix.startsWith("minmaj") || rawSuffix.startsWith("mM")) {
    quality = "minor-major";
    suffix = suffix.startsWith("mmaj") || suffix.startsWith("minmaj") ? suffix.replace(/^m(?:in)?maj/, "") : suffix.slice(2);
  } else if (rawSuffix.startsWith("M") || rawSuffix.startsWith("Δ") || suffix.startsWith("maj")) {
    quality = "major";
    majorSeventh = true;
    suffix = suffix.replace(/^(?:maj|m|δ)/i, "");
  } else if (suffix.startsWith("7sus2") || suffix.startsWith("7sus4") || suffix.startsWith("7sus")) {
    quality = suffix.startsWith("7sus2") ? "sus2" : "sus4";
    extension = 7;
    suffix = suffix.replace(/^7sus(?:2|4)?/, "");
  } else if (suffix.startsWith("dim7") || suffix.startsWith("o7")) {
    quality = "diminished";
    extension = 7;
    suffix = suffix.replace(/^(?:dim|o)7/, "");
  } else if (suffix.startsWith("dim") || suffix.startsWith("o")) {
    quality = "diminished";
    suffix = suffix.replace(/^(?:dim|o)/, "");
  } else if (suffix.startsWith("aug") || suffix.startsWith("+")) {
    quality = "augmented";
    suffix = suffix.replace(/^(?:aug|\+)/, "");
  } else if (suffix.startsWith("sus2")) {
    quality = "sus2";
    suffix = suffix.slice(4);
  } else if (suffix.startsWith("sus4")) {
    quality = "sus4";
    suffix = suffix.slice(4);
  } else if (suffix.startsWith("sus")) {
    quality = "sus4";
    suffix = suffix.slice(3);
  } else if (suffix.startsWith("min") || suffix.startsWith("m") || suffix.startsWith("-")) {
    quality = "minor";
    suffix = suffix.replace(/^(?:min|m|-)/, "");
  }

  const extensionMatch = /^(13|11|9|7|6|5)(?=$|[^0-9])/.exec(suffix);
  if (extensionMatch) {
    extension = Number(extensionMatch[1]);
    suffix = suffix.slice(extensionMatch[1].length);
  }

  let intervals: number[];
  if (quality === "half-diminished") intervals = [0, 3, 6, 10];
  else if (quality === "diminished") intervals = extension === 7 ? [0, 3, 6, 9] : [0, 3, 6];
  else if (quality === "augmented") intervals = extension >= 7 ? [0, 4, 8, 10] : [0, 4, 8];
  else if (quality === "sus2") intervals = extension >= 7 ? [0, 2, 7, 10] : [0, 2, 7];
  else if (quality === "sus4") intervals = extension >= 7 ? [0, 5, 7, 10] : [0, 5, 7];
  else if (quality === "minor-major") intervals = extension >= 9 ? [0, 3, 7, 11, 14] : [0, 3, 7, 11];
  else if (extension === 5) intervals = [0, 7];
  else if (extension === 6) intervals = quality === "minor" ? [0, 3, 7, 9] : [0, 4, 7, 9];
  else if (extension === 9 || extension === 11 || extension === 13) {
    const seventh = quality === "minor" ? 10 : majorSeventh ? 11 : 10;
    const third = quality === "minor" ? 3 : 4;
    intervals = [0, third, 7, seventh, 14];
    if (extension >= 11) intervals.push(17);
    if (extension >= 13) intervals.push(21);
  } else if (extension === 7) {
    intervals = quality === "minor" ? [0, 3, 7, 10] : majorSeventh ? [0, 4, 7, 11] : [0, 4, 7, 10];
  } else {
    intervals = quality === "minor" ? [0, 3, 7] : [0, 4, 7];
  }

  // 6/9 is written with a slash, but the 9 is an extension—not a slash bass.
  if (/^6\/9/.test(rawSuffix.toLowerCase()) || /^m6\/9/.test(rawSuffix.toLowerCase())) intervals.push(9, 14);
  for (const match of suffix.matchAll(/add([b#]?)(2|4|6|9|11|13)/g)) {
    const accidental = match[1];
    const extensionNumber = Number(match[2]);
    const naturalInterval = ({ 2: 14, 4: 17, 6: 9, 9: 14, 11: 17, 13: 21 } as Record<number, number>)[extensionNumber];
    intervals.push(naturalInterval + (accidental === "b" ? -1 : accidental === "#" ? 1 : 0));
  }
  if (suffix.includes("alt")) intervals = [0, 4, 6, 8, 10, 13, 15, 20];

  for (const alteration of suffix.matchAll(/([b#])(5|6|9|11|13)/g)) {
    const accidental = alteration[1];
    const number = Number(alteration[2]);
    const natural = ({ 5: 7, 6: 9, 9: 14, 11: 17, 13: 21 } as Record<number, number>)[number];
    intervals = intervals.filter((value) => value !== natural);
    intervals.push(natural + (accidental === "b" ? -1 : 1));
  }
  if (/no3|omit3/.test(suffix)) intervals = intervals.filter((value) => value !== 3 && value !== 4);
  if (/no5|omit5/.test(suffix)) intervals = intervals.filter((value) => ![6, 7, 8].includes(value));
  const unparsed = suffix
    .replace(/add[b#]?(?:2|4|6|9|11|13)/g, "")
    .replace(/alt/g, "")
    .replace(/[b#](?:5|6|9|11|13)/g, "")
    .replace(/(?:no|omit)(?:3|5)/g, "")
    .replace(/\/9/g, "");
  if (unparsed) return null;

  intervals = [...new Set(intervals)].sort((a, b) => a - b);
  if (!intervals.length || intervals.some((value) => !Number.isFinite(value))) return null;
  const notes = intervals.map((interval) => rootMidi + interval);
  if (slashBass) {
    const bassPc = pitchClass(slashBass);
    if (bassPc === null) return null;
    let bassMidi = Math.floor(rootMidi / 12) * 12 + bassPc;
    if (bassMidi >= rootMidi) bassMidi -= 12;
    if (bassMidi < rootMidi - 12) bassMidi += 12;
    notes.unshift(bassMidi);
  }
  return notes;
}

export function isValidChordSymbol(symbol: string): boolean {
  return chordToMidiNotes(symbol, 3) !== null;
}

export const CHORD_EXAMPLES = [
  "C", "Cm", "C5", "Cdim", "Cdim7", "Caug", "Csus2", "Csus4", "C6", "Cm6", "C6/9", "C7", "Cmaj7", "Cm7", "CmMaj7", "Cm7b5",
  "C9", "Cmaj9", "Cm9", "C11", "Cm11", "C13", "Cmaj13", "Cm13", "C7b5", "C7#5", "C7b9", "C7#9", "C7#11", "C7b13", "C7alt", "C7sus4",
  "Cadd9", "Cmaj7#5", "C/E", "F#m7b5", "Bb13", "G7(b9,#11)",
];
