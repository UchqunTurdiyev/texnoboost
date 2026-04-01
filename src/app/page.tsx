import Image from "next/image";
import LeadForm from "./components/LeadForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-orange-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
            <Image
              src="/logo.PNG"
              alt="TexnoBoost"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            <span className="text-(--tb-orange)">Texno</span>Boost — hammasi oson!
          </h1>

          <p className="max-w-2xl text-slate-700">
            Ro‘yxatdan o‘ting. Operator sizga ma&apos;lumot uchun aloqaga chiqadi
          </p>
        </header>

        <section className="mt-10 grid grid-cols-1">
        

          <div className="rounded-3xl bg-white p-6 ring-1 ring-black/10 shadow-sm">
            <LeadForm />
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} TexnoBoost
        </footer>
      </div>
    </main>
  );
}
