import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

/** O integrante autenticado recebe o painel operacional, sem o rodapé de marketing público. */
export default async function FooterSlot() {
  const user = await getCurrentUser().catch(() => null);
  return user ? null : <Footer />;
}
