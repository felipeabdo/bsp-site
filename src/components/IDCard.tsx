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
              <div className="mt-[2.4cqw] grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-[1.5cqw]">
                <div className="min-w-0">
                  <p className="font-semibold uppercase opacity-80" style={{ fontSize: "2.1cqw", letterSpacing: "0.14em" }}>ID do integrante</p>
                  <p className="whitespace-nowrap font-display leading-none tracking-[-0.035em] text-tinta" style={{ fontSize: "5.8cqw" }}>{m.memberId}</p>
                </div>
                <p className="pb-[0.3cqw] text-right font-semibold leading-tight opacity-80" style={{ fontSize: "2.1cqw" }}>BSB ·<br />2013</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IDCardBack({ m, p }: { m: CardMember; p?: CardPrivate }) {
  const rows: { label: string; value: string; wide?: boolean }[] = [
    { label: "Nascimento", value: fmtDate(p?.birthDate) },
    { label: "Naturalidade", value: p?.birthPlace || "—" },
    { label: "Tipo sanguíneo", value: p?.bloodType || "—" },
    { label: "Camiseta", value: p?.shirtSize || "—" },
    { label: "Emergência", value: [p?.emergencyName, p?.emergencyPhone].filter(Boolean).join(" · ") || "—", wide: true },
  ];

  return (
    <div className="[container-type:inline-size] w-full">
      <div className="relative aspect-[1.586] w-full overflow-hidden rounded-[4cqw] bg-lago text-creme shadow-[0_20px_40px_-18px_rgba(40,121,159,0.6)]">
        <Spiral className="absolute -bottom-[18cqw] -left-[12cqw] h-[64cqw] w-[64cqw] text-sol/20" stroke={7} />
        <div className="absolute inset-0 flex flex-col p-[5cqw]">
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_28cqw] items-start gap-[4cqw] pb-[4cqw]">
            <div className="flex min-w-0 flex-col justify-start gap-[3cqw] pt-[1cqw]">
              <p className="font-semibold uppercase text-creme/75" style={{ fontSize: "2.1cqw", letterSpacing: "0.16em" }}>
                Dados do integrante
              </p>
              <dl className="grid grid-cols-2 gap-x-[3cqw] gap-y-[2.5cqw]">
                {rows.map(({ label, value, wide }) => (
                  <div key={label} className={wide ? "col-span-2 min-w-0" : "min-w-0"}>
                    <dt className="font-semibold uppercase text-creme/75" style={{ fontSize: "2.05cqw", letterSpacing: "0.12em" }}>{label}</dt>
                    <dd className="break-words font-semibold leading-tight text-creme" style={{ fontSize: "3.15cqw" }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex h-[44cqw] flex-col items-center justify-between self-start rounded-[2cqw] bg-creme px-[2cqw] py-[2.3cqw] text-tinta">
              <LogoMark className="h-[12cqw] w-[12cqw] shrink-0 text-sol" />
              <p className="whitespace-nowrap font-display text-center leading-none tracking-[-0.04em] text-lago" style={{ fontSize: "4.5cqw" }}>{m.memberId}</p>
              <p className="text-center font-semibold leading-tight text-lago" style={{ fontSize: "1.8cqw" }}>
                Verifique em<br />/verificar/{m.memberId}
              </p>
            </div>
          </div>
          <p className="shrink-0 text-center font-medium leading-tight text-creme/80" style={{ fontSize: "1.8cqw" }}>
            Documento de identificação interna do Bloco Santo Pecado · Eu curto bloco de rua!
          </p>
        </div>
      </div>
    </div>
  );
}
