"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MemberImage } from "@/components/silhouettes";
import { INSTRUMENT_OPTIONS } from "@/lib/site";

type U = {
  memberId: string;
  joinYear: number;
  firstName: string;
  lastName: string;
  stageName: string | null;
  category: string;
  instrument: string | null;
  leftYear: number | null;
  bio: string | null;
  silhouette: string;
  bodyPhotoType: string;
  hasBody: boolean;
  hasPortrait: boolean;
  photoVersion: number;
  instagram: string | null;
  whatsapp: string | null;
  showContact: boolean;
  birthDate: string | null;
  birthPlace: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  gender: string | null;
  bloodType: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  shirtSize: string | null;
  email: string | null;
};

const v = (x: string | null | undefined) => x ?? "";

function Msg({ ok, text }: { ok: boolean; text: string }) {
  if (!text) return null;
  return (
    <p role={ok ? "status" : "alert"} className={`rounded-2xl p-3 text-sm font-semibold ${ok ? "bg-lago-100 text-lago-700" : "bg-sol-100 text-sol-600"}`}>
      {text}
    </p>
  );
}

function F({ label, id, children, className = "" }: { label: string; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

/* ───────────── Perfil ───────────── */
export function ProfileForm({ user }: { user: U }) {
  const router = useRouter();
  const [d, setD] = useState({
    firstName: v(user.firstName), lastName: v(user.lastName), stageName: v(user.stageName), birthDate: v(user.birthDate),
    birthPlace: v(user.birthPlace), gender: v(user.gender), silhouette: user.silhouette, phone: v(user.phone),
    whatsapp: v(user.whatsapp), showContact: user.showContact, address: v(user.address), city: v(user.city),
    state: v(user.state), zip: v(user.zip), emergencyName: v(user.emergencyName), emergencyPhone: v(user.emergencyPhone),
    bloodType: v(user.bloodType), shirtSize: v(user.shirtSize), category: user.category, leftYear: user.leftYear ? String(user.leftYear) : "",
    instrument: v(user.instrument), instagram: v(user.instagram), bio: v(user.bio),
  });
  const [msg, setMsg] = useState({ ok: true, text: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setD((p) => ({ ...p, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    const j = await res.json();
    setMsg({ ok: res.ok, text: res.ok ? "Perfil atualizado com sucesso!" : j.error || "Erro ao salvar." });
    setSaving(false);
    if (res.ok) router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-10">
      <Section title="Dados pessoais">
        <F label="Nome" id="p-fn"><input id="p-fn" className="input" value={d.firstName} onChange={set("firstName")} required /></F>
        <F label="Sobrenome" id="p-ln"><input id="p-ln" className="input" value={d.lastName} onChange={set("lastName")} required /></F>
        <F label="Nome artístico / apelido" id="p-sn"><input id="p-sn" className="input" value={d.stageName} onChange={set("stageName")} /></F>
        <F label="Data de nascimento" id="p-bd"><input id="p-bd" type="date" className="input" value={d.birthDate} onChange={set("birthDate")} /></F>
        <F label="Local de nascimento" id="p-bp"><input id="p-bp" className="input" value={d.birthPlace} onChange={set("birthPlace")} /></F>
        <F label="Gênero" id="p-g">
          <select id="p-g" className="input" value={d.gender} onChange={set("gender")}>
            <option value="">Prefiro não informar</option><option>Feminino</option><option>Masculino</option><option>Não-binário</option><option>Outro</option>
          </select>
        </F>
        <F label="Silhueta padrão (sem foto)" id="p-sil">
          <select id="p-sil" className="input" value={d.silhouette} onChange={set("silhouette")}>
            <option value="m">Masculina</option><option value="f">Feminina</option>
          </select>
        </F>
      </Section>

      <Section title="No bloco">
        <F label="Relação com o bloco" id="p-cat">
          <select id="p-cat" className="input" value={d.category} onChange={set("category")}>
            <option value="fundador">Fundador(a)</option><option value="atual">Formação atual</option><option value="ex">Já passei pelo bloco</option>
          </select>
        </F>
        {d.category === "ex" && <F label="Até que ano ficou?" id="p-ly"><input id="p-ly" type="number" className="input" value={d.leftYear} onChange={set("leftYear")} /></F>}
        <F label="Instrumento" id="p-in">
          <select id="p-in" className="input" value={d.instrument} onChange={set("instrument")}>
            <option value="">Selecione</option>{INSTRUMENT_OPTIONS.map((i) => <option key={i}>{i}</option>)}
          </select>
        </F>
        <F label="Instagram" id="p-ig"><input id="p-ig" className="input" value={d.instagram} onChange={set("instagram")} placeholder="@seuinsta" /></F>
        <F label="Sua história (aparece no destaque)" id="p-bio" className="sm:col-span-2"><textarea id="p-bio" className="input" value={d.bio} onChange={set("bio")} /></F>
      </Section>

      <Section title="Contato e endereço">
        <F label="Telefone" id="p-ph"><input id="p-ph" className="input" value={d.phone} onChange={set("phone")} /></F>
        <F label="WhatsApp público" id="p-wa"><input id="p-wa" className="input" value={d.whatsapp} onChange={set("whatsapp")} /></F>
        <label className="flex items-center gap-3 rounded-2xl bg-areia p-4 font-semibold sm:col-span-2">
          <input type="checkbox" className="h-5 w-5 accent-[#F9834E]" checked={d.showContact} onChange={(e) => setD((p) => ({ ...p, showContact: e.target.checked }))} />
          Mostrar meu WhatsApp no meu destaque público
        </label>
        <F label="Endereço" id="p-ad" className="sm:col-span-2"><input id="p-ad" className="input" value={d.address} onChange={set("address")} /></F>
        <F label="Cidade" id="p-ci"><input id="p-ci" className="input" value={d.city} onChange={set("city")} /></F>
        <div className="grid grid-cols-2 gap-4">
          <F label="UF" id="p-uf"><input id="p-uf" className="input" value={d.state} onChange={set("state")} /></F>
          <F label="CEP" id="p-cep"><input id="p-cep" className="input" value={d.zip} onChange={set("zip")} /></F>
        </div>
      </Section>

      <Section title="Saúde e emergência (aparece só no verso da sua carteirinha)">
        <F label="Contato de emergência" id="p-en"><input id="p-en" className="input" value={d.emergencyName} onChange={set("emergencyName")} /></F>
        <F label="Telefone de emergência" id="p-ep"><input id="p-ep" className="input" value={d.emergencyPhone} onChange={set("emergencyPhone")} /></F>
        <F label="Tipo sanguíneo" id="p-bt">
          <select id="p-bt" className="input" value={d.bloodType} onChange={set("bloodType")}>
            <option value="">—</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </F>
        <F label="Camiseta" id="p-sh">
          <select id="p-sh" className="input" value={d.shirtSize} onChange={set("shirtSize")}>
            <option value="">—</option>{["PP","P","M","G","GG","XG"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </F>
      </Section>

      <div className="space-y-4">
        <Msg ok={msg.ok} text={msg.text} />
        <button className="btn btn-sol" disabled={saving}>{saving ? "Salvando…" : "Salvar alterações"}</button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="font-display mb-4 text-2xl text-lago">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/* ───────────── Fotos ───────────── */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Não foi possível ler essa imagem.")); };
    img.src = url;
  });
}

function resizeBody(img: HTMLImageElement, png: boolean) {
  let scale = Math.min(1, 1000 / img.naturalWidth, 1600 / img.naturalHeight);
  for (let i = 0; i < 4; i++) {
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const url = png && i < 2 ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.85);
    if (url.length < 2_000_000) return url;
    scale *= 0.8;
  }
  throw new Error("Imagem grande demais. Tente uma foto menor.");
}

/**
 * Redimensiona o PNG mantendo o canal alfa e remove apenas as bordas
 * totalmente transparentes. Isso faz os pés coincidirem com a base visual
 * do card, mesmo quando o arquivo original veio com muita margem vazia.
 */
function resizeTransparentBody(img: HTMLImageElement) {
  let scale = Math.min(1, 1000 / img.naturalWidth, 1600 / img.naturalHeight);
  for (let i = 0; i < 8; i++) {
    const source = document.createElement("canvas");
    source.width = Math.max(1, Math.round(img.naturalWidth * scale));
    source.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const sourceCtx = source.getContext("2d", { willReadFrequently: true });
    if (!sourceCtx) throw new Error("Não foi possível preparar a imagem neste navegador.");
    sourceCtx.clearRect(0, 0, source.width, source.height);
    sourceCtx.drawImage(img, 0, 0, source.width, source.height);

    const pixels = sourceCtx.getImageData(0, 0, source.width, source.height).data;
    let hasTransparency = false;
    let minX = source.width;
    let minY = source.height;
    let maxX = -1;
    let maxY = -1;

    // Considera pixels suavizados da borda como parte da pessoa, mas ignora
    // ruído quase invisível que poderia impedir o recorte da margem vazia.
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        const alpha = pixels[(y * source.width + x) * 4 + 3];
        if (alpha < 245) hasTransparency = true;
        if (alpha > 16) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!hasTransparency || maxX < minX || maxY < minY) {
      throw new Error("Este PNG parece ter fundo opaco. Envie um PNG exportado com transparência real.");
    }

    const contentWidth = maxX - minX + 1;
    const contentHeight = maxY - minY + 1;
    const padX = Math.max(2, Math.round(contentWidth * 0.025));
    const padTop = Math.max(2, Math.round(contentHeight * 0.015));
    // Quase nenhuma margem inferior: os pés ficam alinhados à base do card.
    const padBottom = Math.max(1, Math.round(contentHeight * 0.002));
    const cropX = Math.max(0, minX - padX);
    const cropY = Math.max(0, minY - padTop);
    const cropRight = Math.min(source.width, maxX + 1 + padX);
    const cropBottom = Math.min(source.height, maxY + 1 + padBottom);
    const output = document.createElement("canvas");
    output.width = Math.max(1, cropRight - cropX);
    output.height = Math.max(1, cropBottom - cropY);
    const outputCtx = output.getContext("2d");
    if (!outputCtx) throw new Error("Não foi possível finalizar a imagem neste navegador.");
    outputCtx.clearRect(0, 0, output.width, output.height);
    outputCtx.drawImage(source, cropX, cropY, output.width, output.height, 0, 0, output.width, output.height);

    const url = output.toDataURL("image/png");
    if (url.length < 2_000_000) return url;
    scale *= 0.82;
  }
  throw new Error("O PNG ainda ficou grande demais. Exporte uma versão com resolução menor.");
}

function Photos({ user }: { user: U }) {
  const router = useRouter();
  const [msg, setMsg] = useState({ ok: true, text: "" });
  const [busy, setBusy] = useState("");
  const [bodyType, setBodyType] = useState(user.bodyPhotoType);
  const [bodyData, setBodyData] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [ox, setOx] = useState(50);
  const [oy, setOy] = useState(30);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !img) return;
    const ctx = c.getContext("2d")!;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const cw = Math.min(iw, (ih * 3) / 4) / zoom;
    const ch = (cw * 4) / 3;
    ctx.fillStyle = "#F9F9EA";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, ((iw - cw) * ox) / 100, ((ih - ch) * oy) / 100, cw, ch, 0, 0, c.width, c.height);
  }, [img, zoom, ox, oy]);

  async function post(kind: "body" | "portrait", dataUrl: string) {
    setBusy(kind);
    const res = await fetch("/api/me/photos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, dataUrl, bodyPhotoType: bodyType }),
    });
    const j = await res.json();
    setMsg({ ok: res.ok, text: res.ok ? "Foto salva! Ela já aparece no site." : j.error || "Erro ao enviar." });
    setBusy("");
    if (res.ok) {
      if (kind === "body") setBodyData(null);
      else setImg(null);
      router.refresh();
    }
  }

  async function remove(kind: "body" | "portrait") {
    setBusy(kind);
    await fetch(`/api/me/photos?kind=${kind}`, { method: "DELETE" });
    setBusy("");
    setMsg({ ok: true, text: "Foto removida. A silhueta padrão volta a aparecer." });
    router.refresh();
  }

  async function pickBody(f?: File) {
    if (!f) return;
    try {
      if (bodyType === "cutout" && f.type !== "image/png") {
        throw new Error("Para o modo Recorte PNG, escolha uma imagem PNG com fundo transparente.");
      }
      const i = await loadImage(f);
      setBodyData(bodyType === "cutout" ? resizeTransparentBody(i) : resizeBody(i, f.type === "image/png"));
      setMsg({ ok: true, text: "" });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  async function pickPortrait(f?: File) {
    if (!f) return;
    try {
      setImg(await loadImage(f));
      setZoom(1); setOx(50); setOy(30);
      setMsg({ ok: true, text: "" });
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    }
  }

  const half = bodyType === "half";
  const cutout = bodyType === "cutout";

  return (
    <div className="space-y-8">
      <Msg ok={msg.ok} text={msg.text} />
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Corpo inteiro */}
        <div className="rounded-[2rem] bg-white p-6 ring-1 ring-tinta/5">
          <h3 className="font-display text-3xl text-lago">Foto de corpo inteiro</h3>
          <p className="mt-1 text-tinta/70">Aparece em destaque na página de integrantes. Para o efeito de pessoa saindo do arco, envie um PNG com fundo transparente e a pessoa tocando seu instrumento.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[["full", "Corpo inteiro"], ["half", "Meio corpo"], ["cutout", "Recorte PNG"]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => { setBodyType(k); setBodyData(null); }} aria-pressed={bodyType === k}
                className={`rounded-2xl border-2 px-2 py-2 text-sm font-semibold ${bodyType === k ? "border-sol bg-sol-100 text-sol-600" : "border-tinta/10"}`}>{l}</button>
            ))}
          </div>
          {cutout && <p className="mt-3 rounded-2xl bg-areia p-3 text-sm text-tinta/75">O site aceita o recorte transparente, mas ainda não remove o fundo automaticamente. Envie um PNG com transparência real (não uma imagem JPG salva como PNG). O arquivo é validado antes de ser salvo.</p>}
          <div className="mt-5 flex justify-center rounded-3xl bg-lago p-5">
            <div className={`relative w-48 rounded-t-[999px] rounded-b-3xl border-[6px] border-creme bg-areia text-lago ${cutout ? "aspect-[3/5] overflow-visible" : `overflow-hidden ${half ? "aspect-[4/5]" : "aspect-[3/5]"}`}`}>
              {bodyData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bodyData}
                  alt="Pré-visualização"
                  className={cutout ? "absolute -left-[12%] -top-[9%] h-[116%] w-[124%] object-contain object-bottom drop-shadow-xl" : `relative h-full w-full object-cover ${half ? "object-top" : "object-center"}`}
                />
              ) : (
                <div className={`flex h-full w-full items-end justify-center px-3 pt-8 ${cutout ? "absolute -inset-x-[8%] -top-[4%]" : ""}`}>
                  <MemberImage member={user} kind="body" fit={user.bodyPhotoType === "cutout" ? "contain" : "cover"} className="h-full w-full" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <label className="btn btn-lago cursor-pointer">
              {cutout ? "Escolher PNG transparente" : "Escolher foto"}
              <input type="file" accept={cutout ? "image/png" : "image/*"} className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; e.currentTarget.value = ""; void pickBody(file); }} />
            </label>
            {bodyData && <button className="btn btn-sol" disabled={busy === "body"} onClick={() => post("body", bodyData)}>{busy === "body" ? "Salvando…" : cutout ? "Salvar recorte" : "Salvar foto"}</button>}
            {!bodyData && user.hasBody && (
              <button className="btn btn-ghost !text-sol-600" disabled={busy === "body"} onClick={() => remove("body")}>Remover</button>
            )}
          </div>
          {!user.hasBody && !bodyData && <p className="mt-4 text-sm text-tinta/60">Sem foto enviada, mostramos a silhueta padrão.</p>}
        </div>

        {/* 3x4 */}
        <div className="rounded-[2rem] bg-white p-6 ring-1 ring-tinta/5">
          <h3 className="font-display text-3xl text-lago">Foto 3×4</h3>
          <p className="mt-1 text-tinta/70">Usada na carteirinha e como avatar quando você está logado. Ajuste o enquadramento no formato 3×4.</p>
          <div className="mt-5 flex justify-center rounded-3xl bg-sol p-5">
            {img ? (
              <canvas ref={canvas} width={360} height={480} className="w-44 rounded-2xl border-[6px] border-creme bg-creme" />
            ) : (
              <div className="relative aspect-[3/4] w-44 overflow-hidden rounded-2xl border-[6px] border-creme bg-areia text-lago">
                <MemberImage member={user} kind="portrait" className="h-full w-full" />
              </div>
            )}
          </div>
          {img && (
            <div className="mt-4 space-y-3">
              <Range label="Zoom" value={zoom} min={1} max={3} step={0.05} onChange={setZoom} />
              <Range label="Horizontal" value={ox} min={0} max={100} step={1} onChange={setOx} />
              <Range label="Vertical" value={oy} min={0} max={100} step={1} onChange={setOy} />
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <label className="btn btn-lago cursor-pointer">
              Escolher foto
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickPortrait(e.target.files?.[0])} />
            </label>
            {img && <button className="btn btn-sol" disabled={busy === "portrait"} onClick={() => post("portrait", canvas.current!.toDataURL("image/jpeg", 0.88))}>{busy === "portrait" ? "Salvando…" : "Salvar foto"}</button>}
            {!img && user.hasPortrait && <button className="btn btn-ghost !text-sol-600" disabled={busy === "portrait"} onClick={() => remove("portrait")}>Remover</button>}
          </div>
          {!user.hasPortrait && !img && <p className="mt-4 text-sm text-tinta/60">Sem foto enviada, mostramos o busto padrão.</p>}
        </div>
      </div>
    </div>
  );
}
export { Photos as PhotosManager };

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-lago-700">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[#F9834E]" />
    </label>
  );
}

/* ───────────── Conta ───────────── */
export function AccountPanel({ email }: { email: string | null }) {
  const router = useRouter();
  const [msg, setMsg] = useState({ ok: true, text: "" });
  async function change(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/me/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fd) });
    const j = await res.json();
    setMsg({ ok: res.ok, text: res.ok ? "Senha alterada." : j.error || "Erro." });
    if (res.ok) form.reset();
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={change} className="space-y-4 rounded-[2rem] bg-white p-6 ring-1 ring-tinta/5">
        <h3 className="font-display text-3xl text-lago">Alterar senha</h3>
        <p className="text-sm text-tinta/70">Conta: <strong>{email}</strong></p>
        <F label="Senha atual" id="a-cur"><input id="a-cur" name="current" type="password" required className="input" autoComplete="current-password" /></F>
        <F label="Nova senha (mín. 8 caracteres)" id="a-new"><input id="a-new" name="next" type="password" required minLength={8} className="input" autoComplete="new-password" /></F>
        <Msg ok={msg.ok} text={msg.text} />
        <button className="btn btn-sol">Salvar nova senha</button>
      </form>
      <div className="rounded-[2rem] bg-areia p-6">
        <h3 className="font-display text-3xl text-lago">Sessão</h3>
        <p className="mt-2 text-tinta/75">Encerre sua sessão neste dispositivo.</p>
        <button onClick={logout} className="btn btn-lago mt-5">Sair da conta</button>
      </div>
    </div>
  );
}

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn btn-sol no-print">
      Imprimir / salvar PDF
    </button>
  );
}
