import Image from "next/image";
import LeadForm from "./components/LeadForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <Image
              src="/texnoboost.png"
              alt="TexnoBoost"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            <span className="text-(--tb-orange)">Texno</span>Boost — hammasi oson!
          </h1>

          <p className="max-w-2xl text-white/70">
            Ro‘yxatdan o‘ting. Ma’lumotlaringiz Telegram bot orqali guruhga yuboriladi.
          </p>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <h2 className="text-xl font-semibold">Nima olasiz?</h2>
            <ul className="mt-4 space-y-3 text-white/75">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Tez ro‘yxatdan o‘tish
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Operatorlar siz bilan bog‘lanadi
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Ma’lumotlar Telegram guruhga tushadi
              </li>
            </ul>

            <div className="mt-6 rounded-2xl bg-linear-to-br from-(--tb-orange)/20 to-white/5 p-5 ring-1 ring-white/10">
              <p className="text-sm text-white/80">
                Formani to‘ldiring — yuborgandan keyin “Rahmat” sahifasiga o‘tasiz va 10 soniyada Telegram’ga yo‘naltirilasiz.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <LeadForm />
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} TexnoBoost
        </footer>
      </div>
    </main>
  );
}
