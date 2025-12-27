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

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-black/10 shadow-sm">
            <h2 className="text-xl font-semibold">Perfectumning afzalliklari</h2>

            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Barqaror aloqa — qo‘ng‘iroqlar uzilmaydi, signal ishonchli ishlaydi
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Toza ovoz sifati — suhbat aniq, shovqinsizroq eshitiladi
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Ulanish oson — ariza qoldirasiz, operator tezda bog‘lanadi
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-(--tb-orange)" />
                Qulay xizmat — qo‘llab-quvvatlash xizmati mavjud
              </li>
            </ul>

            <div className="mt-6 rounded-2xl bg-orange-100 p-5 ring-1 ring-black/10">
              <p className="text-sm text-slate-700">
                Formani to‘ldiring — arizangiz qabul qilinadi. Operatorlar qisqa vaqt ichida siz bilan bog‘lanib,
                ulanish bo‘yicha yordam beradi.
              </p>
            </div>
          </div>

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
