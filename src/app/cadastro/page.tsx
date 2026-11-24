import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { RegisterForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Cadastro de integrante" };
export const dynamic = "force-dynamic";

export default async function CadastroPage() {
  if (await getCurrentUser()) redirect("/configuracoes");
  return (
    <AuthShell wide title="Cadastro de integrante" subtitle="Em 4 passos rápidos você ganha seu ID (ano-ordem), sua carteirinha e seu espaço na página de integrantes.">
      <RegisterForm />
    </AuthShell>
  );
}
