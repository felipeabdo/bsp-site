import { LogoMark, Spiral, WordmarkHorizontal } from "@/components/art";
import { MemberImage } from "@/components/silhouettes";
import { displayName, fullName } from "@/lib/member-utils";

type CardMember = {
  memberId: string;
  joinYear: number;
  firstName: string;
  lastName: string;
  stageName: string | null;
  category: string;
  instrument: string | null;
  leftYear: number | null;
  silhouette: string;
  hasBody: boolean;
  hasPortrait: boolean;
  photoVersion: number;
  bodyPhotoType: string;
};

export type CardPrivate = {
  birthDate?: string | null;
  birthPlace?: string | null;
  bloodType?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  shirtSize?: string | null;
  city?: string | null;
  state?: string | null;
};

const CAT: Record<string, string> = { fundador: "Fundador(a)", atual: "Formação atual", ex: "Ex-integrante" };

function Barcode({ value }: { value: string }) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  const bits = ("1011" + [...value].map((c) => c.charCodeAt(0).toString(2).padStart(7, "0")).join("") + "1101")
    .split("")
    .map(Number);
  let i = 0;
  while (i < bits.length) {
    let j = i;
    while (j < bits.length && bits[j] === bits[i]) j++;
    if (bits[i] === 1) bars.push({ x, w: j - i });
    x += j - i;
    i = j;
  }
  return (
    <svg viewBox={`0 0 ${x} 24`} preserveAspectRatio="none" className="h-full w-full" aria-label={`Código de barras ${value}`} role="img">
      {bars.map((b, k) => (
        <rect key={k} x={b.x} y={0} width={b.w} height={24} fill="currentColor" />
      ))}
    </svg>
  );
}

const fmtDate = (d?: string | null) => (d ? d.split("-").reverse().join("/") : "—");

export function IDCardFront({ m }: { m: CardMember }) {
  const since = m.category === "ex" && m.leftYear ? `${m.joinYear}–${m.leftYear}` : `desde ${m.joinYear}`;
  return (
    <div className="[container-type:inline-size] w-full">
      <div className="relative aspect-[1.586] w-full overflow-hidden rounded-[4cqw] bg-sol text-creme shadow-[0_20px_40px_-18px_rgba(40,121,159,0.6)]">
        <Spiral className="absolute -right-[10cqw] -top-[14cqw] h-[60cqw] w-[60cqw] text-lago" stroke={7} />
        <div className="absolute inset-y-0 left-0 w-[3.2cqw] bg-lago" />
        <div className="absolute inset-0 grid grid-cols-[30cqw_1fr] gap-[4cqw] p-[5cqw] pl-[7cqw]">
          <div className="flex flex-col">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2.2cqw] border-[0.9cqw] border-creme bg-areia text-lago">
              <MemberImage member={m} kind="portrait" className="h-full w-full" />
            </div>
            <div className="mt-[2cqw] rounded-[1.6cqw] bg-creme px-[1.5cqw] py-[1cqw] text-center text-tinta">
              <div className="h-[6.5cqw]"><Barcode value={m.memberId} /></div>
            </div>
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-[2cqw]">
              <div className="flex min-w-0 flex-col items-start">
                <WordmarkHorizontal className="h-[4.2cqw] w-[48cqw] text-creme" />
                <span className="mt-[0.6cqw] whitespace-nowrap font-semibold uppercase text-tinta" style={{ fontSize: "2cqw", letterSpacing: "0.1em" }}>Carteirinha de integrante</span>
              </div>
            </div>
            <div className="mt-auto">
              <p className="font-semibold uppercase opacity-90" style={{ fontSize: "2.6cqw", letterSpacing: "0.1em" }}>
                {CAT[m.category] ?? "Integrante"} · {since}
              </p>
              <p className="font-display uppercase leading-[0.95]" style={{ fontSize: "7.4cqw" }}>
                {displayName(m)}
              </p>
              {fullName(m) !== displayName(m) && (
                <p className="truncate font-medium opacity-90" style={{ fontSize: "3.2cqw" }}>{fullName(m)}</p>
              )}
              <p className="mt-[1.5cqw] inline-block rounded-full bg-lago px-[2.4cqw] py-[0.8cqw] font-semibold" style={{ fontSize: "3cqw" }}>
                {m.instrument ?? "Integrante"}
              </p>
              <div className="mt-[2.4cqw] flex items-end justify-between">
                <div>
                  <p className="font-semibold uppercase opacity-80" style={{ fontSize: "2.3cqw", letterSpacing: "0.14em" }}>ID do integrante</p>
                  <p className="font-display leading-none text-tinta" style={{ fontSize: "9.5cqw" }}>{m.memberId}</p>
                </div>
                <p className="text-right font-semibold opacity-80" style={{ fontSize: "2.3cqw" }}>BSB · 2013</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IDCardBack({ m, p }: { m: CardMember; p?: CardPrivate }) {
  const rows: [string, string][] = [
    ["Nascimento", fmtDate(p?.birthDate)],
    ["Naturalidade", p?.birthPlace || "—"],
    ["Tipo sanguíneo", p?.bloodType || "—"],
    ["Camiseta", p?.shirtSize || "—"],
    ["Emergência", [p?.emergencyName, p?.emergencyPhone].filter(Boolean).join(" · ") || "—"],
  ];
  return (
    <div className="[container-type:inline-size] w-full">
      <div className="relative aspect-[1.586] w-full overflow-hidden rounded-[4cqw] bg-lago text-creme shadow-[0_20px_40px_-18px_rgba(40,121,159,0.6)]">
        <Spiral className="absolute -bottom-[18cqw] -left-[12cqw] h-[64cqw] w-[64cqw] text-sol/20" stroke={7} />
        <div className="absolute inset-x-0 top-[5cqw] h-[8cqw] bg-tinta" />
        <div className="absolute inset-0 flex flex-col p-[5cqw]">
          <div className="mt-[13cqw] grid flex-1 grid-cols-[1fr_30cqw] gap-[4cqw]">
            <dl className="space-y-[1.6cqw] self-start">
              {rows.map(([k, v]) => (
                <div key={k}>
                  <dt className="font-semibold uppercase opacity-75" style={{ fontSize: "2.1cqw", letterSpacing: "0.14em" }}>{k}</dt>
                  <dd className="font-semibold leading-tight" style={{ fontSize: "3.3cqw" }}>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col items-center justify-between rounded-[2cqw] bg-creme p-[2cqw] text-tinta">
              <LogoMark className="h-[14cqw] w-[14cqw] text-sol" />
              <p className="font-display text-center leading-none" style={{ fontSize: "6cqw" }}>{m.memberId}</p>
              <p className="text-center font-semibold" style={{ fontSize: "1.9cqw" }}>Verifique em<br />/verificar/{m.memberId}</p>
            </div>
          </div>
          <p className="text-center font-medium opacity-80" style={{ fontSize: "2.2cqw" }}>
            Documento de identificação interna do Bloco Santo Pecado · Eu curto bloco de rua!
          </p>
        </div>
      </div>
    </div>
  );
}
