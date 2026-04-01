// src/app/api/new/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import TargetLeadModel from "@/models/TargetLead";

export async function GET() {
  try {
    await connectToDB();

    const leads = await TargetLeadModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formattedLeads = leads.map((lead: any) => ({
      id: String(lead._id),
      fullName: lead.fullName || "",
      phone: lead.phone || "",
      location: lead.location || "",
      age: lead.age || null,
      businessType: lead.businessType || "",
      budget: lead.budget || "",
      status: lead.status || "LID",
      createdAt: lead.createdAt,
      lastComment: lead.comments?.length > 0 
        ? lead.comments[lead.comments.length - 1].text 
        : "",
    }));

    return NextResponse.json({ leads: formattedLeads });
  } catch (error: any) {
    console.error("GET /api/new error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}