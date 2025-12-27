"use client";

import { useEffect, useState } from "react";

export default function ThankYouPage() {
  const [name, setName] = useState("Arizachi");
  const [sec, setSec] = useState(10);

  const telegramUrl =
    process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || "https://t.me/";

  useEffect(() => {
    // ✅ prerender vaqtida window ishlamaydi, shuning uchun faqat useEffect ichida o'qiymiz
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
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl px-4 py-14">
        <div className="rounded-3xl bg-white/5 p-8 ring-1 ring-white/10 text-center">
          <h1 className="text-3xl font-semibold">
            Rahmat, <span className="text-(--tb-orange)">{name}</span>!
          </h1>

          <p className="mt-3 text-white/70">
            Ma’lumotlaringiz qabul qilindi. Tez orada siz bilan bog‘lanamiz.
          </p>

          <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="text-white/70">
              Telegram sahifasiga{" "}
              <span className="text-(--tb-orange) font-semibold">
                {sec}
              </span>{" "}
              soniyada o‘tasiz…
            </p>
          </div>

          <a
            href={telegramUrl}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-(--tb-orange) px-5 py-3 font-semibold text-black hover:brightness-110"
          >
            Telegram’ga o‘tish
          </a>
        </div>
      </div>
    </main>
  );
}
