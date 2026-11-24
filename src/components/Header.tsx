"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark, Spiral, Wordmark } from "@/components/art";
import { MemberImage } from "@/components/silhouettes";
import { NAV, SITE } from "@/lib/site";

export type HeaderUser = {
  memberId: string;
  firstName: string;
  stageName: string | null;
  silhouette: string;
  hasBody: boolean;
  hasPortrait: boolean;
  photoVersion: number;
  bodyPhotoType: string;
} | null;

export default function Header({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      wasOpenRef.current = true;
      closeRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      openerRef.current?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Ao navegar, fecha o menu e o submenu do integrante.
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1181) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenu(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const name = user ? user.stageName?.split(" ")[0] || user.firstName : "";

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b-2 border-transparent transition-all ${
          scrolled ? "border-[#0E2E3E] bg-creme/92 shadow-[0_6px_30px_-12px_rgba(14,46,62,0.28)] backdrop-blur-md" : "bg-creme"
        }`}
      >
        <div className="container-bsp flex h-[4.5rem] items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={`${SITE.name} — início`}>
            <LogoMark className="h-11 w-11 text-sol transition-transform duration-300 group-hover:scale-105" />
            <Wordmark className="h-12 w-[78px] text-lago sm:h-14 sm:w-[92px]" />
          </Link>

          <nav className="hidden items-center gap-1 min-[1181px]:flex" aria-label="Principal">
            {user ? (
              <Link href="/area-integrante" aria-current="page" className="relative rounded-full bg-lago px-4 py-2 text-[0.9rem] font-extrabold text-creme">
                Área do Integrante
              </Link>
            ) : NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative rounded-full px-3 py-2 text-[0.9rem] font-extrabold transition-colors 2xl:px-4 2xl:text-[0.95rem] ${
                  isActive(item.href) ? "bg-lago text-creme" : "text-tinta hover:bg-sol-100 hover:text-sol-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border-[2.5px] border-[#0E2E3E] bg-white py-1 pl-1 pr-3 font-extrabold shadow-[3px_3px_0_#0E2E3E] transition hover:-translate-y-0.5"
                  aria-haspopup="menu"
                  aria-expanded={menu}
                >
                  <span className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-[#0E2E3E] bg-lago-100">
                    <MemberImage member={user} kind="portrait" className="h-full w-full" />
                  </span>
                  <span className="hidden text-sm sm:block">{name}</span>
                </button>
                {menu && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 animate-fade overflow-hidden rounded-3xl border-[2.5px] border-[#0E2E3E] bg-white p-2 shadow-[6px_6px_0_#0E2E3E]"
                  >
                    <div className="mb-1 rounded-2xl bg-lago px-4 py-3 text-creme">
                      <p className="text-xs uppercase tracking-widest opacity-80">Integrante</p>
                      <p className="font-display text-2xl">{user.memberId}</p>
                    </div>
                    <MenuLink href="/configuracoes?aba=perfil" label="Configurações" />
                    <MenuLink href="/configuracoes?aba=fotos" label="Minhas fotos" />
                    <MenuLink href="/configuracoes?aba=carteirinha" label="Minha carteirinha" />
                    <button
                      onClick={logout}
                      className="w-full rounded-2xl px-4 py-2.5 text-left text-sm font-extrabold text-sol-600 hover:bg-sol-100"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/entrar" className="header-entry-btn hidden min-[1181px]:inline-flex" aria-label="Área do Integrante">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[1.15em] w-[1.15em]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
                </svg>
                Área do Integrante
              </Link>
            )}

            <button
              ref={openerRef}
              onClick={() => setOpen(true)}
              className="header-burger min-[1181px]:hidden"
              aria-label="Abrir menu"
              aria-expanded={open}
              aria-controls="mobile-navigation-menu"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Menu mobile de tela cheia, com abertura circular inspirada na referência. */}
      <div
        id="mobile-navigation-menu"
        className={`mobile-menu-panel fixed inset-0 z-50 overflow-y-auto bg-lago text-creme min-[1181px]:hidden ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-label="Menu principal"
      >
        <Spiral className="pointer-events-none absolute -right-24 top-24 h-[28rem] w-[28rem] animate-spin-slower text-sol/20" stroke={7} />
        <Spiral className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 animate-spin-slow text-creme/15" stroke={9} />

        <div className="relative flex min-h-full flex-col px-6 pb-8 pt-4 sm:px-10">
          <div className="flex h-[4.5rem] items-center justify-between sm:h-20">
            <Link href="/" className="flex items-center gap-3" aria-label="Bloco Santo Pecado — início" onClick={() => setOpen(false)}>
              <LogoMark className="h-11 w-11 text-sol" />
              <Wordmark className="h-12 w-[78px] text-creme sm:h-14 sm:w-[92px]" />
            </Link>
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              className="mobile-menu-close"
              aria-label="Fechar menu"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <ul className="my-7 flex flex-1 flex-col justify-center px-0 sm:my-10">
            {(user ? [{ href: "/area-integrante", label: "Área do Integrante" }] : NAV).map((item, i) => (
              <li
                key={item.href}
                style={{ transitionDelay: open ? `${250 + i * 60}ms` : "0ms" }}
                className="mobile-menu-item overflow-hidden border-b border-creme/20"
              >
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`mobile-menu-link flex items-center justify-between py-3 ${isActive(item.href) ? "text-sol" : "text-creme"}`}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mobile-menu-footer flex flex-col gap-3 sm:flex-row">
            {user ? (
              <button onClick={logout} className="mobile-menu-action mobile-menu-action--ghost flex-1">
                Sair
              </button>
            ) : (
              <Link href="/entrar" className="mobile-menu-action mobile-menu-action--cream flex-1" onClick={() => setOpen(false)}>
                Área do Integrante
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} role="menuitem" className="block rounded-2xl px-4 py-2.5 text-sm font-extrabold hover:bg-sol-100">
      {label}
    </Link>
  );
}
