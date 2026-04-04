// Örnak: app/api/purchase/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, name, value, currency = 'UZS' } = body;

  // Telefon raqamini hash qilish (Meta xavfsizlik uchun talab qiladi)
  const crypto = require('crypto');
  const hashedPhone = crypto.createHash('sha256').update(phone.replace(/\D/g, '')).digest('hex');

  const fbData = {
    data: [
      {
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        user_data: {
          ph: [hashedPhone],
        },
        custom_data: {
          value: value, // Masalan: 500000
          currency: currency,
        },
      },
    ],
  };

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fbData),
    }
  );

  const result = await response.json();
  return NextResponse.json(result);
}