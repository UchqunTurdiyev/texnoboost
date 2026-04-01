import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Interface - TypeScript uchun (UTM maydonlari qo'shildi)
export interface ITargetLead extends Document {
  fullName: string;
  phone: string;
  location?: string;
  age?: number;
  businessType?: string;
  budget?: string;
  source: string;
  status: string;
  lastComment: string; 
  note?: string;
  // UTM maydonlari
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  reminderDate?: string; // MUHIM: Refreshda vaqt o'zgarmasligi uchun String qilindi
  comments: Array<{
    text: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema - MongoDB uchun
const TargetLeadSchema = new Schema<ITargetLead>(
  {
    fullName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    phone: { 
      type: String, 
      required: true, 
      trim: true 
    },
    location: { 
      type: String, 
      trim: true,
      default: "" 
    },
    age: { 
      type: Number, 
      min: 5, 
      max: 120 
    },
    businessType: { 
      type: String, 
      default: "" 
    },
    budget: { 
      type: String, 
      default: "" 
    },
    source: { 
      type: String, 
      default: "website" 
    },
    status: { 
      type: String, 
      default: "LID" 
    },
    lastComment: { 
      type: String, 
      default: "", 
      trim: true 
    },
    note: { 
      type: String, 
      default: "" 
    },
    // UTM maydonlari sxemaga qo'shildi
    utm_source: { type: String, default: "" },
    utm_medium: { type: String, default: "" },
    utm_campaign: { type: String, default: "" },
    utm_content: { type: String, default: "" },
    utm_term: { type: String, default: "" },
    
    // MUHIM: Date o'rniga String ishlatamiz. Shunda "2026-03-31T14:00" kabi aniq saqlanadi
    reminderDate: { type: String, default: "" },
    
    comments: [
      {
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { 
    timestamps: true 
  }
);

// 3. Model Export
const TargetLeadModel: Model<ITargetLead> =
  mongoose.models.TargetLead || mongoose.model<ITargetLead>("TargetLead", TargetLeadSchema);

export default TargetLeadModel;