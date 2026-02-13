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

async function sendToTelegram(payload: LeadPayload) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIdRaw = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatIdRaw) {
    throw new Error("ENV yo‘q: TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID");
  }

  const chatIdNum = Number(chatIdRaw);
  const chat_id: number | string = Number.isFinite(chatIdNum) ? chatIdNum : chatIdRaw;

  const text =
    `<b>TexnoBoost — yangi ariza</b>\n\n` +
    `<b>Ism Familya:</b> ${escapeHtml(payload.fullName)}\n` +
    `<b>Tel:</b> ${escapeHtml(payload.phone)}\n` +
    `<b>Manzil:</b> ${escapeHtml(payload.location)}\n` +
    `<b>Yosh:</b> ${escapeHtml(String(payload.age))}`;

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
    throw new Error(tgJson.description || `Telegram error. status=${tgRes.status}`);
  }
}

async function sendToAppSheet(payload: LeadPayload) {
  const appId = process.env.APPSHEET_APP_ID?.trim();
  const apiKey = process.env.APPSHEET_API_KEY?.trim();
  const table = (process.env.APPSHEET_TABLE || "Leads").trim();



  if (!appId || !apiKey) {
    throw new Error("ENV yo‘q: APPSHEET_APP_ID / APPSHEET_API_KEY");
  }

  const url = `https://api.appsheet.com/api/v2/apps/${appId}/tables/${table}/Action`;

  const ops = (process.env.CRM_OPERATORS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const idx = ops.length ? Math.floor(Date.now() / 60000) % ops.length : 0; // navbat
const assignedTo = ops[idx] || (process.env.CRM_ASSIGNED_TO || "").trim();

  const source = (process.env.CRM_SOURCE || "website").trim();

  // CRM'da sizda Location va Age ustuni yo‘q bo‘lishi mumkin.
  // Shuning uchun LastComment ichiga yozib yuboramiz (CRM’da yo‘qolib ketmaydi).
  const lastComment = `Location: ${payload.location}; Age: ${payload.age}`;

  const body = {
    Action: "Add",
    Properties: {
      Timezone: "Asia/Tashkent",
    },
    Rows: [
      {
        // Eslatma: LeadID UNIQUEID() AppSheet’da o‘zi to‘ldiriladi
        CreatedAt: new Date().toISOString(),
        FullName: payload.fullName,
        Phone: payload.phone,
        Source: source,
        AssignedTo: assignedTo, // Security filter uchun bo‘sh qolmasin
        Status: "Ko'tarmadi",
        LastComment: lastComment,
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ApplicationAccessKey: apiKey,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(`AppSheet error. status=${res.status}. ${JSON.stringify(json)}`);
  }

  return json;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<LeadPayload>;

    const fullName = clean(body.fullName);
    const phone = normalizePhone(clean(body.phone));
    const location = clean(body.location);
    const age = Number(body.age);

    if (fullName.length < 3)
      return NextResponse.json({ ok: false, error: "Ism Familya noto‘g‘ri." }, { status: 400 });
    if (!isValidPhone(phone))
      return NextResponse.json({ ok: false, error: "Telefon raqam noto‘g‘ri." }, { status: 400 });
    if (location.length < 2)
      return NextResponse.json({ ok: false, error: "Yashash joyi noto‘g‘ri." }, { status: 400 });
    if (!Number.isFinite(age) || age < 5 || age > 120)
      return NextResponse.json({ ok: false, error: "Yosh noto‘g‘ri." }, { status: 400 });

    const payload: LeadPayload = { fullName, phone, location, age };

    // 1) Telegram — asosiy kanal (uzilmasin)
    await sendToTelegram(payload);

    // 2) AppSheet — ikkinchi kanal (xato bo‘lsa ham Telegram ishlaydi)
    let appsheetOk = true;
    let appsheetError: string | null = null;

    try {
      await sendToAppSheet(payload);
    } catch (e) {
      appsheetOk = false;
      appsheetError = e instanceof Error ? e.message : "AppSheet noma’lum xatolik";
      // Telegramga ta’sir qilmaymiz
    }

    return NextResponse.json({ ok: true, appsheetOk, appsheetError });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Noma’lum xatolik" },
      { status: 500 }
    );
  }
}
