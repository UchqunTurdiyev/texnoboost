"use client";

import { useEffect, useState } from "react";

export default function ThankYouPage() {
  const [name, setName] = useState("Arizachi");
  const [sec, setSec] = useState(10);

  const telegramUrl =
    (process.env.NEXT_PUBLIC_TELEGRAM_URL || "").trim() ||
    "https://t.me/texnoboostadmin1";

  useEffect(() => {
    const savedName = sessionStorage.getItem("tb_name");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedName?.trim()) setName(savedName.trim());

    const timer = window.setInterval(() => {
      setSec((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const go = window.setTimeout(() => {
      window.location.href = telegramUrl;
    }, 10_000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(go);
    };
  }, [telegramUrl]);

  return (
    <main className="min-h-screen bg-green-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-14">
        <div className="tb-card w-full rounded-3xl bg-white p-8 ring-1 ring-black/10 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 ring-1 ring-black/10">
            <span className="text-2xl">✅</span>
          </div>

          <h1 className="text-3xl font-semibold">
            Rahmat, <span style={{ color: "#F97316" }}>{name}</span>!
          </h1>

          <p className="mt-3 text-slate-700">
            Ma’lumotlaringiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.
          </p>

          <div className="mt-6 rounded-2xl bg-green-50 p-4 ring-1 ring-black/10">
            <p className="text-slate-700">
              Telegram sahifasiga{" "}
              <span key={sec} className="tb-pop font-semibold" style={{ color: "#F97316" }}>
                {sec}
              </span>{" "}
              soniyada o‘tasiz…
            </p>

            {/* ✅ QISQA bar (aniq ko‘rinadi) + 10s davomida qisqaradi */}
            <div className="mx-auto mt-3 h-2 w-60 overflow-hidden rounded-full bg-black/10">
              <div className="tb-bar h-full w-full" />
            </div>
          </div>

          <a
            href={telegramUrl}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 font-semibold text-black hover:brightness-110 active:scale-[0.99] transition"
            style={{ backgroundColor: "#F97316" }}
          >
            Telegram’ga o‘tish
          </a>

          <p className="mt-5 text-xs text-slate-600">
            Agar avtomatik o‘tmasa, yuqoridagi tugmani bosing.
          </p>
        </div>
      </div>

      {/* ✅ 100% ishlaydigan CSS animatsiya (kutubxonasiz) */}
      <style>{`
        .tb-card{
          animation: tbCardIn .45s cubic-bezier(.2,.9,.2,1) both;
        }
        @keyframes tbCardIn{
          from{ opacity:0; transform: translateY(10px) scale(.98); }
          to{ opacity:1; transform: translateY(0) scale(1); }
        }

        .tb-bar{
          background: #F97316;
          transform-origin: left;
          animation: tbShrink 10s linear forwards;
        }
        @keyframes tbShrink{
          from{ transform: scaleX(1); }
          to{ transform: scaleX(0); }
        }

        .tb-pop{
          display:inline-block;
          animation: tbPop .18s ease-out;
        }
        @keyframes tbPop{
          from{ transform: scale(.85); opacity:.5; }
          to{ transform: scale(1); opacity:1; }
        }
      `}</style>
    </main>
  );
}
