import { LogoMark } from "@/components/art";

function Bar({ className = "" }: { className?: string }) {
  return <span className={`skeleton block rounded-full ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-[80vh] bg-creme" role="status" aria-live="polite" aria-label="Carregando o site do Bloco Santo Pecado">
      <section className="relative isolate min-h-[calc(100svh-4.5rem)] sm:min-h-[calc(100svh-5rem)] overflow-hidden bg-lago">
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(40,121,159,0.98),rgba(40,121,159,0.76))]" />
        <div className="container-bsp section-pad relative z-10 flex min-h-[calc(100svh-4.5rem)] sm:min-h-[calc(100svh-5rem)] items-center py-12">
          <div className="w-full max-w-2xl">
            <div className="skeleton mb-8 h-8 w-56 rounded-full" />
            <div className="skeleton mb-4 h-16 w-[min(30rem,85vw)] rounded-xl sm:h-20" />
            <div className="skeleton mb-4 h-16 w-[min(24rem,72vw)] rounded-xl sm:h-20" />
            <Bar className="mt-8 h-4 w-full max-w-xl" />
            <Bar className="mt-3 h-4 w-[85%] max-w-lg" />
            <Bar className="mt-3 h-4 w-[62%] max-w-sm" />
            <div className="mt-9 flex gap-3">
              <div className="skeleton h-12 w-40 rounded-md" />
              <div className="skeleton h-12 w-48 rounded-md" />
            </div>
            <div className="mt-10 flex items-center gap-4 border-t border-creme/20 pt-5">
              <div className="skeleton h-14 w-16 rounded-lg" />
              <div className="w-44"><Bar className="h-3 w-full" /><Bar className="mt-2 h-3 w-3/4" /></div>
            </div>
          </div>
        </div>
        <div className="absolute right-8 top-8 hidden h-32 w-36 items-center justify-center rounded-full border border-creme/20 bg-creme/10 p-4 sm:flex">
          <LogoMark className="aspect-[266/220] h-full w-full text-creme/20" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-lago/60 to-transparent" />
      </section>

      <section className="bg-creme py-10 sm:py-14">
        <div className="container-bsp section-pad">
          <Bar className="mx-auto h-3 w-44" />
          <Bar className="mx-auto mt-4 h-10 w-[min(46rem,92vw)] rounded-lg" />
          <div className="mt-8 flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-24 w-64 shrink-0 rounded-2xl" />)}
          </div>
        </div>
      </section>

      <section className="container-bsp section-pad grid gap-8 py-16 md:grid-cols-2">
        <div className="space-y-4">
          <Bar className="h-4 w-32" />
          <Bar className="h-12 w-4/5 rounded-lg" />
          <Bar className="h-4 w-full" />
          <Bar className="h-4 w-11/12" />
          <Bar className="h-4 w-3/4" />
          <div className="skeleton mt-7 h-12 w-44 rounded-md" />
        </div>
        <div className="skeleton min-h-[18rem] rounded-[2rem]" />
      </section>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
