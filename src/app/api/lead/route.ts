import { NextResponse } from "next/server";

type LeadPayload = {
  fullName: string;
  phone: string;
  location: string;
  age: number;
};

function clean(s: unknown) {
  return typeof s === "string" ? s.trim() : "";
}

function isValidPhone(v: string) {
  return /^\+?\d[\d\s()-]{7,}$/.test(v);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LeadPayload>;

    const fullName = clean(body.fullName);
    const phone = clean(body.phone);
    const location = clean(body.location);
    const age = Number(body.age);

    if (fullName.length < 3) {
      return NextResponse.json({ ok: false, error: "Ism Familya noto‘g‘ri." }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ ok: false, error: "Telefon raqam noto‘g‘ri." }, { status: 400 });
    }
    if (location.length < 2) {
      return NextResponse.json({ ok: false, error: "Yashash joyi noto‘g‘ri." }, { status: 400 });
    }
    if (!Number.isFinite(age) || age < 5 || age > 120) {
      return NextResponse.json({ ok: false, error: "Yosh noto‘g‘ri." }, { status: 400 });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { ok: false, error: "Server sozlanmagan: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID yo‘q." },
        { status: 500 }
      );
    }

    const text =
      `<b>🟠 TexnoBoost — yangi ariza</b>\n\n` +
      `<b>Ism Familya:</b> ${fullName}\n` +
      `<b>Tel:</b> ${phone}\n` +
      `<b>Manzil:</b> ${location}\n` +
      `<b>Yosh:</b> ${age}\n\n` +
      `<i>Yuborilgan vaqt:</i> ${new Date().toLocaleString("uz-UZ")}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const tgJson = (await tgRes.json()) as { ok?: boolean; description?: string };

    if (!tgRes.ok || !tgJson.ok) {
      throw new Error(tgJson.description || "Telegram API xatolik.");
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Noma’lum xatolik.";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
