"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BodySilhouette } from "@/components/silhouettes";
import { INSTRUMENT_OPTIONS } from "@/lib/site";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error || "Não foi possível entrar.");
      setLoading(false);
      return;
    }
    router.push("/area-integrante");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="field-label" htmlFor="l-email">E-mail</label>
        <input id="l-email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="field-label" htmlFor="l-pass">Senha</label>
        <input id="l-pass" name="password" type="password" required className="input" autoComplete="current-password" />
      </div>
      {error && <p className="rounded-2xl bg-sol-100 p-3 text-sm font-semibold text-sol-600" role="alert">{error}</p>}
      <button className="btn btn-sol w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      <div className="rounded-3xl bg-sol/10 p-5 text-center">
        <p className="font-display text-2xl text-lago">Tem tambor? Tem carteirinha.</p>
        <p className="mt-1 text-sm text-tinta/70">O cadastro é exclusivo para quem já faz parte do bloco.</p>
        <Link href="/cadastro" className="mt-3 inline-flex font-bold text-lago underline underline-offset-4">Quero criar meu acesso de integrante</Link>
      </div>
    </form>
  );
}

type Data = Record<string, string>;
const STEPS = ["Conta", "Você", "Contato", "No bloco"];
const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export function RegisterForm() {
  const router = useRouter();
  const year = new Date().getFullYear();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState("");
  const [d, setD] = useState<Data>({
    email: "", password: "", password2: "", firstName: "", lastName: "", stageName: "", birthDate: "", birthPlace: "",
    gender: "", silhouette: "m", phone: "", whatsapp: "", address: "", city: "Brasília", state: "DF", zip: "",
    emergencyName: "", emergencyPhone: "", bloodType: "", shirtSize: "", category: "atual", joinYear: String(year),
    leftYear: "", instrument: "", instagram: "", bio: "",
  });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setD((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    let alive = true;
    const y = Number(d.joinYear);
    if (!y) return;
    fetch(`/api/member-id/next?year=${y}`)
      .then((r) => r.json())
      .then((j) => alive && setPreviewId(j.memberId ?? ""))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [d.joinYear]);

  function validate(i: number): string {
    if (i === 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return "Informe um e-mail válido.";
      if (d.password.length < 8) return "A senha precisa ter pelo menos 8 caracteres.";
      if (d.password !== d.password2) return "As senhas não conferem.";
    }
    if (i === 1) {
      if (!d.firstName.trim() || !d.lastName.trim()) return "Informe nome e sobrenome.";
      if (!d.birthDate) return "Informe sua data de nascimento.";
      if (!d.birthPlace.trim()) return "Informe seu local de nascimento.";
    }
    if (i === 3) {
      const y = Number(d.joinYear);
      if (!y || y < 2013 || y > year) return `O ano de ingresso deve estar entre 2013 e ${year}.`;
      if (d.category === "fundador" && y !== 2013) return "Fundadores ingressaram em 2013.";
    }
    return "";
  }

  function next() {
    const err = validate(step);
    setError(err);
    if (!err) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function submit() {
    const err = validate(3);
    if (err) return setError(err);
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    const j = await res.json();
    if (!res.ok) {
      setError(j.error || "Erro ao cadastrar.");
      setLoading(false);
      return;
    }
    router.push("/area-integrante?novo=1");
    router.refresh();
  }

  return (
    <div>
      <ol className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${i <= step ? "bg-sol text-creme" : "bg-areia text-tinta/60"}`}>{i + 1}</span>
            <span className={`hidden text-sm font-semibold sm:block ${i === step ? "text-tinta" : "text-tinta/50"}`}>{s}</span>
            {i < STEPS.length - 1 && <span className={`h-1 flex-1 rounded-full ${i < step ? "bg-sol" : "bg-areia"}`} />}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 sm:grid-cols-2">
        {step === 0 && (
          <>
            <Field className="sm:col-span-2" label="E-mail" id="email"><input id="email" type="email" className="input" value={d.email} onChange={set("email")} autoComplete="email" /></Field>
            <Field label="Senha (mín. 8 caracteres)" id="pw"><input id="pw" type="password" className="input" value={d.password} onChange={set("password")} autoComplete="new-password" /></Field>
            <Field label="Confirmar senha" id="pw2"><input id="pw2" type="password" className="input" value={d.password2} onChange={set("password2")} autoComplete="new-password" /></Field>
          </>
        )}
        {step === 1 && (
          <>
            <Field label="Nome" id="fn"><input id="fn" className="input" value={d.firstName} onChange={set("firstName")} autoComplete="given-name" /></Field>
            <Field label="Sobrenome" id="ln"><input id="ln" className="input" value={d.lastName} onChange={set("lastName")} autoComplete="family-name" /></Field>
            <Field label="Nome artístico / apelido (opcional)" id="sn" className="sm:col-span-2"><input id="sn" className="input" value={d.stageName} onChange={set("stageName")} placeholder="Como você é conhecido(a) no bloco" /></Field>
            <Field label="Data de nascimento" id="bd"><input id="bd" type="date" className="input" value={d.birthDate} onChange={set("birthDate")} /></Field>
            <Field label="Local de nascimento (cidade/UF)" id="bp"><input id="bp" className="input" value={d.birthPlace} onChange={set("birthPlace")} placeholder="Ex.: Brasília/DF" /></Field>
            <Field label="Gênero (opcional)" id="g">
              <select id="g" className="input" value={d.gender} onChange={set("gender")}>
                <option value="">Prefiro não informar</option>
                <option>Feminino</option>
                <option>Masculino</option>
                <option>Não-binário</option>
                <option>Outro</option>
              </select>
            </Field>
            <div>
              <span className="field-label">Silhueta padrão (quando não houver foto)</span>
              <div className="flex gap-3">
                {(["m", "f"] as const).map((v) => (
                  <button type="button" key={v} onClick={() => setD((p) => ({ ...p, silhouette: v }))} aria-pressed={d.silhouette === v}
                    className={`flex flex-1 items-center gap-2 rounded-2xl border-2 p-2 text-sm font-semibold ${d.silhouette === v ? "border-sol bg-sol-100 text-sol-600" : "border-tinta/10 bg-white text-tinta/70"}`}>
                    <BodySilhouette variant={v} className="h-14 w-7" /> {v === "m" ? "Masculina" : "Feminina"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Telefone" id="ph"><input id="ph" className="input" value={d.phone} onChange={set("phone")} autoComplete="tel" placeholder="(61) 99999-9999" /></Field>
            <Field label="WhatsApp (para o perfil público, opcional)" id="wa"><input id="wa" className="input" value={d.whatsapp} onChange={set("whatsapp")} placeholder="(61) 99999-9999" /></Field>
            <Field label="Endereço" id="ad" className="sm:col-span-2"><input id="ad" className="input" value={d.address} onChange={set("address")} autoComplete="street-address" placeholder="Rua, número, complemento" /></Field>
            <Field label="Cidade" id="ci"><input id="ci" className="input" value={d.city} onChange={set("city")} /></Field>
            <div className="grid grid-cols-[1fr_1.4fr] gap-4">
              <Field label="UF" id="uf"><select id="uf" className="input" value={d.state} onChange={set("state")}>{UFS.map((u) => <option key={u}>{u}</option>)}</select></Field>
              <Field label="CEP" id="cep"><input id="cep" className="input" value={d.zip} onChange={set("zip")} autoComplete="postal-code" /></Field>
            </div>
            <Field label="Contato de emergência (nome)" id="en"><input id="en" className="input" value={d.emergencyName} onChange={set("emergencyName")} /></Field>
            <Field label="Telefone de emergência" id="ep"><input id="ep" className="input" value={d.emergencyPhone} onChange={set("emergencyPhone")} /></Field>
            <Field label="Tipo sanguíneo" id="bt">
              <select id="bt" className="input" value={d.bloodType} onChange={set("bloodType")}>
                <option value="">Não sei / prefiro não informar</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Tamanho da camiseta" id="sh">
              <select id="sh" className="input" value={d.shirtSize} onChange={set("shirtSize")}>
                <option value="">—</option>
                {["PP","P","M","G","GG","XG"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </>
        )}
        {step === 3 && (
          <>
            <div className="sm:col-span-2">
              <span className="field-label">Qual é a sua relação com o bloco?</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {[["fundador", "Fundador(a)", "Estava no começo, em 2013"], ["atual", "Formação atual", "Toco hoje no bloco"], ["ex", "Já passei pelo bloco", "Toquei e segui outro caminho"]].map(([v, t, s]) => (
                  <button type="button" key={v} aria-pressed={d.category === v}
                    onClick={() => setD((p) => ({ ...p, category: v, joinYear: v === "fundador" ? "2013" : p.joinYear }))}
                    className={`rounded-2xl border-2 p-4 text-left ${d.category === v ? "border-sol bg-sol-100" : "border-tinta/10 bg-white"}`}>
                    <strong className="block">{t}</strong><span className="text-sm text-tinta/70">{s}</span>
                  </button>
                ))}
              </div>
            </div>
            <Field label="Ano em que entrou no bloco" id="jy">
              <select id="jy" className="input" value={d.joinYear} onChange={set("joinYear")}>
                {Array.from({ length: year - 2012 }, (_, i) => year - i).map((y) => <option key={y}>{y}</option>)}
              </select>
            </Field>
            {d.category === "ex" ? (
              <Field label="Até que ano ficou?" id="ly"><input id="ly" type="number" min={Number(d.joinYear)} max={year} className="input" value={d.leftYear} onChange={set("leftYear")} /></Field>
            ) : (
              <div className="rounded-2xl bg-lago p-4 text-creme">
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Seu ID será</p>
                <p className="font-display text-4xl">{previewId || `${d.joinYear}-…`}</p>
              </div>
            )}
            <Field label="Instrumento" id="in">
              <select id="in" className="input" value={d.instrument} onChange={set("instrument")}>
                <option value="">Selecione</option>
                {INSTRUMENT_OPTIONS.map((i) => <option key={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="Instagram (opcional)" id="ig"><input id="ig" className="input" value={d.instagram} onChange={set("instagram")} placeholder="@seuinsta" /></Field>
            <Field label="Sua história no bloco (aparece no seu destaque)" id="bio" className="sm:col-span-2">
              <textarea id="bio" className="input" value={d.bio} onChange={set("bio")} placeholder="Como você chegou, o que o instrumento significa para você, memórias do bloco…" />
            </Field>
          </>
        )}
      </div>

      {error && <p className="mt-5 rounded-2xl bg-sol-100 p-3 text-sm font-semibold text-sol-600" role="alert">{error}</p>}

      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 0 ? <button type="button" className="btn btn-ghost !text-tinta" onClick={() => { setError(""); setStep(step - 1); }}>← Voltar</button> : <span />}
        {step < 3 ? (
          <button type="button" className="btn btn-sol" onClick={next}>Continuar →</button>
        ) : (
          <button type="button" className="btn btn-sol" onClick={submit} disabled={loading}>{loading ? "Criando…" : "Criar meu cadastro"}</button>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-tinta/70">Já tem conta? <Link href="/entrar" className="font-bold text-lago underline">Entrar</Link></p>
    </div>
  );
}

function Field({ label, id, children, className = "" }: { label: string; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label" htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
