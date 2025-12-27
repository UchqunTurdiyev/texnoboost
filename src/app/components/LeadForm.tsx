"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LeadPayload = {
  fullName: string;
  phone: string;
  location: string;
  age: number;
};

function normalizePhone(v: string) {
  return v.replace(/\s+/g, " ").trim();
}

function isValidPhone(v: string) {
  return /^\+?\d[\d\s()-]{7,}$/.test(v);
}

export default function LeadForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const a = Number(age);
    return (
      fullName.trim().length >= 3 &&
      isValidPhone(normalizePhone(phone)) &&
      location.trim().length >= 2 &&
      Number.isFinite(a) &&
      a >= 5 &&
      a <= 120
    );
  }, [fullName, phone, location, age]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Iltimos, barcha maydonlarni to‘g‘ri to‘ldiring.");
      return;
    }

    const payload: LeadPayload = {
      fullName: fullName.trim(),
      phone: normalizePhone(phone),
      location: location.trim(),
      age: Number(age),
    };

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Yuborishda xatolik yuz berdi.");
      }

      // ✅ QO‘SHILDI: ismni thank-you sahifasida chiqarish uchun saqlab qo‘yamiz
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tb_name", payload.fullName);
        // xohlasangiz boshqa maydonlarni ham saqlash mumkin:
        // sessionStorage.setItem("tb_phone", payload.phone);
        // sessionStorage.setItem("tb_location", payload.location);
        // sessionStorage.setItem("tb_age", String(payload.age));
      }

      // ✅ QO‘SHILDI: querysiz o‘tamiz (prerender muammo bermaydi)
      router.push("/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Noma’lum xatolik.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">Ro‘yxatdan o‘tish</h3>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Ism Familya</label>
        <input
          className="w-full rounded-2xl bg-orange-100 px-4 py-3 text-black/70 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-(--tb-orange)"
          placeholder="Masalan: Aliyev Azamat"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Telefon raqam</label>
        <input
          className="w-full rounded-2xl bg-orange-100 px-4 py-3 text-black/70 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-(--tb-orange)"
          placeholder="+998 90 123 45 67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Yashash joyi</label>
        <input
          className="w-full rounded-2xl bg-orange-100 px-4 py-3 text-black/70 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-(--tb-orange)"
          placeholder="Masalan: Samarqand"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          autoComplete="address-level2"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-white/70">Yosh (Age)</label>
        <input
          className="w-full rounded-2xl bg-orange-100 px-4 py-3 text-black/70 outline-none ring-1 ring-orange-600 focus:ring-2 focus:ring-(--tb-orange)"
          placeholder="Masalan: 21"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          inputMode="numeric"
        />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 p-3 text-sm text-red-200 ring-1 ring-red-500/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !canSubmit}
        className="w-full rounded-2xl bg-orange-600 cursor-pointer px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Yuborilmoqda..." : "Yuborish"}
      </button>

      <p className="text-xs text-white/50">
        Yuborgandan so‘ng siz “Rahmat” sahifasiga o‘tasiz.
      </p>
    </form>
  );
}
