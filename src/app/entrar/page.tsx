import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function EntrarPage() {
  if (await getCurrentUser()) redirect("/area-integrante");
  return (
    <AuthShell title="Entrar" subtitle="Acesse suas configurações, suas fotos e a sua carteirinha de integrante.">
      <LoginForm />
    </AuthShell>
  );
}
