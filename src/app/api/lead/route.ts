import { NextResponse } from "next/server";
import TargetLeadModel from "@/models/TargetLead";
import { connectToDB } from "@/lib/mongodb";

// SHU QATORNI QO'SHING: Bu Next.js'ga ma'lumotni keshlamaslikni buyuradi!
export const dynamic = 'force-dynamic';

function clean(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

function normalizePhone(v: string): string {
  return v.replace(/\s+/g, " ").trim();
}

function isValidPhone(v: string): boolean {
  return /^\+?\d[\d\s()-]{7,}$/.test(v);
}

function escapeHtml(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendToTelegram(payload: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIdRaw = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatIdRaw) {
    console.error("TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID .env da yo‘q");
    return;
  }

  const chat_id = Number.isFinite(Number(chatIdRaw)) ? Number(chatIdRaw) : chatIdRaw;

  const text =
    `<b>🚀 TexnoBoost — yangi ariza</b>\n\n` +
    `<b>Ism Familya:</b> ${escapeHtml(payload.fullName)}\n` +
    `<b>Tel:</b> ${escapeHtml(payload.phone)}\n` +
    `<b>Manzil:</b> ${escapeHtml(payload.location || "Ko'rsatilmagan")}\n` +
    `<b>Yosh:</b> ${escapeHtml(payload.age?.toString() || "Ko'rsatilmagan")}\n\n` +
    `<b>🌐 Marketing (UTM):</b>\n` +
    `<b>Manba (Source):</b> ${escapeHtml(payload.utm_source || "direct")}\n` +
    `<b>Tur (Medium):</b> ${escapeHtml(payload.utm_medium || "-")}\n` +
    `<b>Kampaniya:</b> ${escapeHtml(payload.utm_campaign || "-")}\n` +
    `<b>Kontent:</b> ${escapeHtml(payload.utm_content || "-")}\n` +
    `<b>Kalit so'z:</b> ${escapeHtml(payload.utm_term || "-")}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = clean(body.fullName);
    const phone = normalizePhone(clean(body.phone));
    const location = clean(body.location);
    const age = Number(body.age);

    // Validatsiya
    if (fullName.length < 2)
      return NextResponse.json({ ok: false, error: "Ism Familya noto‘g‘ri" }, { status: 400 });
    if (!isValidPhone(phone))
      return NextResponse.json({ ok: false, error: "Telefon raqam noto‘g‘ri" }, { status: 400 });

    await connectToDB();

    // UTM ma'lumotlarini olish va tozalash
    const utmData = {
      utm_source: clean(body.utm_source) || "direct",
      utm_medium: clean(body.utm_medium) || "",
      utm_campaign: clean(body.utm_campaign) || "",
      utm_content: clean(body.utm_content) || "",
      utm_term: clean(body.utm_term) || ""
    };

    // MongoDB ga yozish (Diqqat: TargetLeadModel da utm_ maydonlari qo'shilgan bo'lishi kerak)
    const lead = await TargetLeadModel.create({
      fullName,
      phone,
      location,
      age,
      source: "website",
      status: "LID",
      businessType: body.businessType || "",
      budget: body.budget || "",
      ...utmData, 
      comments: [],
    });

    // Telegramga barcha ma'lumotlarni yuborish
    await sendToTelegram({ 
      fullName, 
      phone, 
      location, 
      age,
      ...utmData 
    }).catch((err) =>
      console.error("Telegram xatosi:", err)
    );

    return NextResponse.json({ ok: true, leadId: lead._id });
  } catch (error: any) {
    console.error("Lead yaratish xatosi:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Server xatosi" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDB();

    const leads = await TargetLeadModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedLeads = leads.map((lead: any) => ({
      id: String(lead._id),
      fullName: lead.fullName,
      phone: lead.phone,
      location: lead.location,
      age: lead.age,
      businessType: lead.businessType,
      budget: lead.budget,
      status: lead.status,
      createdAt: lead.createdAt,
      // Admin panel uchun UTM ma'lumotlarini ham qaytaramiz
      utm_source: lead.utm_source || "",
      utm_medium: lead.utm_medium || "",
      utm_campaign: lead.utm_campaign || "",
      utm_content: lead.utm_content || "",
      utm_term: lead.utm_term || "",
      lastComment: lead.comments?.length
        ? lead.comments[lead.comments.length - 1].text
        : "",
    }));

    return NextResponse.json({ leads: formattedLeads });
  } catch (error: any) {
    console.error("Leads olish xatosi:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}