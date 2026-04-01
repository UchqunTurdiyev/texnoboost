import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TargetLeadModel from "@/models/TargetLead";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDB();
    const { id } = params;
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { error: "Komment bo‘sh bo‘lmasligi kerak" },
        { status: 400 }
      );
    }

    const lead = await TargetLeadModel.findById(id);
    if (!lead) {
      return NextResponse.json({ error: "Lead topilmadi" }, { status: 404 });
    }

    const newComment = {
      text: text.trim(),
      createdAt: new Date(),
    };

    lead.comments.push(newComment);
    await lead.save();

    return NextResponse.json({ 
      success: true, 
      comment: newComment 
    });
  } catch (error: any) {
    console.error("Comment error:", error);
    return NextResponse.json({ 
      error: error.message || "Server xatosi" 
    }, { status: 500 });
  }
}