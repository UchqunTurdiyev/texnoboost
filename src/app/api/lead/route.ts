import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LeadPayload = {
  fullName: string;
  phone: string;
  location: string;
  age: number;
};

function clean(s: unknown) {
  return typeof s === "string" ? s.trim() : "";
}
function normalizePhone(v: string) {
  return v.replace(/\s+/g, " ").trim();
}
function isValidPhone(v: string) {
  return /^\+?\d[\d\s()-]{7,}$/.test(v);
}
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LeadPayload>;

    const fullName = clean(body.fullName);
    const phone = normalizePhone(clean(body.phone));
    const location = clean(body.location);
    const age = Number(body.age);

    if (fullName.length < 3) return NextResponse.json({ ok: false, error: "Ism Familya noto‘g‘ri." }, { status: 400 });
    if (!isValidPhone(phone)) return NextResponse.json({ ok: false, error: "Telefon raqam noto‘g‘ri." }, { status: 400 });
    if (location.length < 2) return NextResponse.json({ ok: false, error: "Yashash joyi noto‘g‘ri." }, { status: 400 });
    if (!Number.isFinite(age) || age < 5 || age > 120) return NextResponse.json({ ok: false, error: "Yosh noto‘g‘ri." }, { status: 400 });

    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatIdRaw = process.env.TELEGRAM_CHAT_ID?.trim();

    if (!token || !chatIdRaw) {
      return NextResponse.json({ ok: false, error: "ENV yo‘q: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID" }, { status: 500 });
    }

    // ⚠️ .env.local'da chat id ni QO'SHTIRNOQSIZ yozing!
    // TELEGRAM_CHAT_ID=-100123...
    const chatIdNum = Number(chatIdRaw);
    const chat_id: number | string = Number.isFinite(chatIdNum) ? chatIdNum : chatIdRaw;

    const text =
      `<b>🟠 TexnoBoost — yangi ariza</b>\n\n` +
      `<b>Ism Familya:</b> ${escapeHtml(fullName)}\n` +
      `<b>Tel:</b> ${escapeHtml(phone)}\n` +
      `<b>Manzil:</b> ${escapeHtml(location)}\n` +
      `<b>Yosh:</b> ${escapeHtml(String(age))}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const tgJson = (await tgRes.json()) as { ok?: boolean; description?: string };

    if (!tgRes.ok || !tgJson.ok) {
      // ✅ Endi aniq Telegram xatosi clientga qaytadi
      return NextResponse.json(
        { ok: false, error: tgJson.description || `Telegram error. status=${tgRes.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Noma’lum xatolik" },
      { status: 500 }
    );
  }
}
