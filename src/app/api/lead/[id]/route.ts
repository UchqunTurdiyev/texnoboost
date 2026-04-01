import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TargetLeadModel from "@/models/TargetLead";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDB();
    const body = await req.json();

    const updateData: any = {};
    const pushData: any = {};

    // Status o'zgarganda
    if (body.status) updateData.status = body.status;

    // Eslatma vaqti o'zgarganda (Yangi qo'shilgan qism)
    if (body.reminderDate !== undefined) {
      updateData.reminderDate = body.reminderDate;
    }

    // Yangi izoh qo'shilganda
    if (body.commentText) {
      updateData.lastComment = body.commentText; // Oxirgi izoh sifatida saqlash
      pushData.comments = { text: body.commentText, createdAt: new Date() }; // Tarixga qo'shish
    }

    const updatedLead = await TargetLeadModel.findByIdAndUpdate(
      id,
      { 
        $set: updateData,
        ...(body.commentText ? { $push: pushData } : {}) 
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    // Parolni .env fayldan yoki qat'iy o'zingiz belgilagan qiymatdan tekshiradi
    const correctPassword = process.env.TARGET_DELETE_PASSWORD || "admin123";

    if (password !== correctPassword) {
      return NextResponse.json({ error: "Parol noto'g'ri!" }, { status: 403 });
    }

    await connectToDB();
    const deleted = await TargetLeadModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Lead topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Lead muvaffaqiyatli o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}