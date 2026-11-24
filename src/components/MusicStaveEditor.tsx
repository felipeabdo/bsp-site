"use client";

import { useState, type MouseEvent } from "react";
import type { InstrumentComposition } from "@/lib/music";

type Clef = "treble" | "bass";
type Props = {
  instrument: string;
  composition: InstrumentComposition;
  onChange: <K extends keyof InstrumentComposition>(key: K, index: number, value: InstrumentComposition[K][number]) => void;
};

const STEP_LABELS = ["1", "e", "+", "a", "2", "e", "+", "a", "3", "e", "+", "a", "4", "e", "+", "a"];
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL_LABEL: Record<string, string> = { natural: "♮ natural", sharp: "♯ sustenido", flat: "♭ bemol", doubleSharp: "𝄪 dobrado sustenido", doubleFlat: "𝄫 dobrado bemol" };
const ACCIDENTAL: Record<string, string> = { natural: "", sharp: "#", flat: "b", doubleSharp: "##", doubleFlat: "bb" };
const BOTTOM_NOTE: Record<Clef, { letter: string; octave: number; y: number }> = {
  treble: { letter: "E", octave: 4, y: 98 },
  bass: { letter: "G", octave: 2, y: 98 },
};
const STAFF_TOP = 58;
const STAFF_BOTTOM = 98;
const STAFF_STEP = 5;
const SVG_WIDTH = 1088;
const SVG_HEIGHT = 150;
const LEFT = 82;
const STEP_WIDTH = 62;

function noteForPosition(clef: Clef, position: number, accidental: string) {
  const base = BOTTOM_NOTE[clef];
  const startIndex = base.octave * 7 + LETTERS.indexOf(base.letter);
  const absolute = startIndex + position;
  const octave = Math.floor(absolute / 7);
  const letter = LETTERS[((absolute % 7) + 7) % 7];
  return `${letter}${ACCIDENTAL[accidental] ?? ""}${octave}`;
}

function positionForNote(clef: Clef, note: string) {
  const match = /^([A-G])([#b]{0,2})(-?\d{1,2})$/i.exec(note || "");
  if (!match) return null;
  const base = BOTTOM_NOTE[clef];
  const absolute = Number(match[3]) * 7 + LETTERS.indexOf(match[1].toUpperCase());
  const startIndex = base.octave * 7 + LETTERS.indexOf(base.letter);
  return absolute - startIndex;
}

function noteY(position: number) { return STAFF_BOTTOM - position * STAFF_STEP; }

function Staff({ clef, label, notes, techniques, onNote, onTechnique, accidental, setAccidental, stringInstrument }: {
  clef: Clef;
  label: string;
  notes: string[];
  techniques: InstrumentComposition["techniques"];
  onNote: (index: number, note: string) => void;
  onTechnique: (index: number, value: InstrumentComposition["techniques"][number]) => void;
  accidental: string;
  setAccidental: (value: string) => void;
  stringInstrument: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  function handleStaffClick(event: MouseEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * SVG_WIDTH;
    const y = ((event.clientY - bounds.top) / bounds.height) * SVG_HEIGHT;
    const index = Math.floor((x - LEFT) / STEP_WIDTH);
    if (y < 40 || y > 120 || index < 0 || index >= 16) return;
    const position = Math.max(-4, Math.min(14, Math.round((STAFF_BOTTOM - y) / STAFF_STEP)));
    const next = noteForPosition(clef, position, accidental);
    onNote(index, notes[index] === next ? "" : next);
  }

  return <div className="mt-4 rounded-2xl border border-tinta/10 bg-white p-3 sm:p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><p className="text-sm font-bold text-lago">{label}</p><p className="text-xs text-tinta/55">Clique na altura desejada dentro da pauta para inserir a nota.</p></div>
      <label className="flex items-center gap-2 text-xs font-semibold text-tinta/65">Acidente
        <select aria-label={`Acidente para ${label}`} className="input !w-auto !py-1.5 !px-2 text-xs" value={accidental} onChange={(event) => setAccidental(event.target.value)}>
          {Object.entries(NATURAL_LABEL).map(([value, name]) => <option key={value} value={value}>{name}</option>)}
        </select>
      </label>
    </div>
    <div className="mt-3 overflow-x-auto pb-2">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width={SVG_WIDTH} height={SVG_HEIGHT} role="img" aria-label={`Pauta em clave de ${clef === "treble" ? "sol" : "fá"}; clique para inserir notas`} onClick={handleStaffClick} className="block max-w-none select-none touch-manipulation">
        <rect x={LEFT} y="42" width={STEP_WIDTH * 16} height="78" rx="8" fill="#F9F9EA" />
        {Array.from({ length: 17 }).map((_, index) => <line key={`v-${index}`} x1={LEFT + index * STEP_WIDTH} x2={LEFT + index * STEP_WIDTH} y1="43" y2="120" stroke="#28799F" strokeOpacity={index % 4 === 0 ? 0.24 : 0.09} strokeWidth={index % 4 === 0 ? 1.6 : 1} />)}
        {[0, 1, 2, 3, 4].map((index) => <line key={`staff-${index}`} x1={LEFT} x2={SVG_WIDTH - 10} y1={STAFF_TOP + index * 10} y2={STAFF_TOP + index * 10} stroke="#28799F" strokeWidth="1.4" />)}
        <text x="24" y="105" fontSize="72" fill="#28799F" fontFamily="serif">{clef === "treble" ? "𝄞" : "𝄢"}</text>
        <text x={LEFT} y="22" fontSize="11" fill="#28799F">{clef === "treble" ? "SOL" : "FÁ"}</text>
        {notes.map((note, index) => {
          if (!note) return null;
          const pos = positionForNote(clef, note);
          if (pos === null) return null;
          const x = LEFT + index * STEP_WIDTH + STEP_WIDTH / 2;
          const y = noteY(pos);
          const match = /^([A-G])([#b]{0,2})(-?\d{1,2})$/i.exec(note);
          const accidentalText = match?.[2] === "#" ? "♯" : match?.[2] === "b" ? "♭" : match?.[2] === "##" ? "𝄪" : match?.[2] === "bb" ? "𝄫" : "";
          const ledgerPositions = pos < 0 ? Array.from({ length: Math.floor(Math.abs(pos) / 2) }, (_, ledger) => -2 * (ledger + 1)) : pos > 8 ? Array.from({ length: Math.floor((pos - 8) / 2) }, (_, ledger) => 10 + 2 * ledger) : [];
          return <g key={`${clef}-${index}`}>
            {ledgerPositions.map((ledgerPos) => <line key={ledgerPos} x1={x - 14} x2={x + 14} y1={noteY(ledgerPos)} y2={noteY(ledgerPos)} stroke="#28799F" strokeWidth="1.3" />)}
            {accidentalText && <text x={x - 16} y={y + 4} textAnchor="end" fontSize="18" fill="#F9834E">{accidentalText}</text>}
            <ellipse cx={x} cy={y} rx="7.5" ry="5.4" transform={`rotate(-18 ${x} ${y})`} fill="#F9834E" stroke="#28799F" strokeWidth="1.1" />
            <line x1={x + 7} x2={x + 7} y1={y - 1} y2={y - 29} stroke="#28799F" strokeWidth="1.5" />
          </g>;
        })}
        {Array.from({ length: 16 }).map((_, index) => <g key={`step-${index}`}>
          <text x={LEFT + index * STEP_WIDTH + STEP_WIDTH / 2} y="137" textAnchor="middle" fontSize="11" fill="#28799F" fontWeight="700">{STEP_LABELS[index]}</text>
          <rect x={LEFT + index * STEP_WIDTH + 1} y="42" width={STEP_WIDTH - 2} height="78" fill="transparent" onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} />
          {hovered === index && <rect x={LEFT + index * STEP_WIDTH + 1} y="42" width={STEP_WIDTH - 2} height="78" fill="#28799F" fillOpacity="0.06" pointerEvents="none" />}
        </g>)}
      </svg>
    </div>
    <div className="step-grid-16 mt-2">
      {notes.map((note, index) => <div key={index} className="min-w-0 rounded-lg bg-areia p-1.5 text-center">
        <span className="block text-[10px] font-bold text-tinta/45">{index + 1}</span>
        <span className="block min-h-5 truncate text-xs font-bold text-lago">{note || "—"}</span>
        <div className="mt-1 flex items-center justify-center gap-1">
          {note && <button type="button" aria-label={`Apagar nota do passo ${index + 1}`} onClick={() => onNote(index, "")} className="text-[10px] font-bold text-sol-700 underline">×</button>}
          {stringInstrument && note && <select aria-label={`Técnica da nota ${index + 1}`} className="max-w-full rounded border border-tinta/15 bg-white px-1 py-0.5 text-[9px]" value={techniques[index] ?? "none"} onChange={(event) => onTechnique(index, event.target.value as InstrumentComposition["techniques"][number])}><option value="none">Normal</option><option value="slide">Slide</option><option value="hammer">Hammer-on</option></select>}
        </div>
      </div>)}
    </div>
  </div>;
}

export default function MusicStaveEditor({ instrument, composition, onChange }: Props) {
  const [trebleAccidental, setTrebleAccidental] = useState("natural");
  const [bassAccidental, setBassAccidental] = useState("natural");
  const isString = instrument === "baixo" || instrument === "guitarra";
  return <div>
    <p className="mb-3 text-sm text-tinta/65">As duas pautas ficam alinhadas aos 16 passos. Escolha o acidente e clique na altura da nota. Cada coluna representa uma semicolcheia.</p>
    <Staff clef="treble" label="Clave de sol · região aguda" notes={composition.notes} techniques={composition.techniques} onNote={(index, value) => onChange("notes", index, value)} onTechnique={(index, value) => onChange("techniques", index, value)} accidental={trebleAccidental} setAccidental={setTrebleAccidental} stringInstrument={isString} />
    <Staff clef="bass" label="Clave de fá · região grave" notes={composition.bassNotes} techniques={composition.bassTechniques} onNote={(index, value) => onChange("bassNotes", index, value)} onTechnique={(index, value) => onChange("bassTechniques", index, value)} accidental={bassAccidental} setAccidental={setBassAccidental} stringInstrument={isString} />
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-tinta/60"><span>• Clique novamente na mesma posição para remover a nota.</span><span>• Acidentes disponíveis: natural, sustenido, bemol e dobrados.</span></div>
  </div>;
}
