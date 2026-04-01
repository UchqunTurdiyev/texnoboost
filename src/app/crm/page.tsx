"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  useDroppable,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- 1. Turlar (Interfaces) ---
interface LeadComment {
  text: string;
  createdAt: string;
}

interface Lead {
  id: string;
  fullName: string;
  phone: string;
  address?: string; 
  age?: string | number; 
  status: string;
  createdAt: string;
  comments: LeadComment[];
  lastComment?: string;
  reminderDate?: string; // Bazadagi reminderDate
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const STATUSES = ["LID", "KO'TARMADI", "O'YLAB KO'RAMAN", "O'QIYMAN", "TO'LOV QILDI", "KEYINGI OY", "O'QIMAYDI", "ONLINE"];

// --- 2. Ustun Komponenti ---
function StatusColumn({ status, count, children }: { status: string; count: number; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className="min-w-80 shrink-0 bg-[#0f172a]/50 rounded-xl border border-gray-900 p-3 flex flex-col h-fit min-h-[500px]">
      <h3 className="text-gray-500 font-bold text-[10px] mb-4 uppercase tracking-widest">
        {status} ({count})
      </h3>
      <div className="space-y-3 flex-1">{children}</div>
    </div>
  );
}

// --- 3. Lead Card Komponenti ---
const LeadCard = ({ lead, setLeads, isOverlay = false }: { lead: Lead; setLeads: React.Dispatch<React.SetStateAction<Lead[]>>; isOverlay?: boolean }) => {
  const [newComment, setNewComment] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isOverlay ? 999 : "auto",
  };

  const displayComment = useMemo(() => {
    if (lead.comments && lead.comments.length > 0) {
      return lead.comments[lead.comments.length - 1].text;
    }
    return lead.lastComment || null;
  }, [lead.comments, lead.lastComment]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(lead.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReminderChange = async (dateValue: string) => {
    // UI yangilash
    setLeads((prev) => prev.map(l => l.id === lead.id ? { ...l, reminderDate: dateValue } : l));
    // Bazaga saqlash
    try {
      await fetch(`/api/lead/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderDate: dateValue }),
      });
    } catch (err) {
      console.error("Reminder error", err);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/lead/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentText: newComment }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map(l => l.id === lead.id ? { ...l, ...data.lead, id: String(data.lead._id || data.lead.id) } : l));
        setNewComment("");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const password = prompt("O'chirish paroli:");
    if (!password) return;
    const res = await fetch(`/api/lead/${lead.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setLeads((prev) => prev.filter(l => l.id !== lead.id));
    else alert("Xatolik!");
  };

  return (
    <div ref={setNodeRef} style={style} className={`p-4 rounded-lg border border-gray-800 bg-[#1e293b] text-white group ${isOverlay ? 'ring-2 ring-blue-500 shadow-2xl scale-105' : ''}`}>
      <div className="flex justify-between items-start mb-2 text-[10px] text-gray-500">
        <span>{new Date(lead.createdAt).toLocaleString("uz-UZ", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-sm">🗑</button>
          <div {...attributes} {...listeners} className="cursor-grab hover:text-white p-1 text-[16px]">::</div>
        </div>
      </div>

      <div className="mb-2">
        <p className="font-bold text-sm truncate uppercase">{lead.fullName}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-blue-400 text-xs font-mono">{lead.phone}</p>
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={handleCopy}
            className={`text-[9px] px-1.5 py-0.5 rounded border transition-all ${copied ? 'bg-green-600 border-green-600 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}
          >
            {copied ? "Nusxalandi" : "Copy"}
          </button>
        </div>
      </div>

      {/* ESLATMA VAQTINI BELGILASH QISMI */}
      <div className="mb-2 p-2 bg-[#0f172a] rounded border border-gray-800">
        <label className="text-[9px] text-gray-500 block mb-1 uppercase tracking-tighter">🔔 Eslatma o&apos;rnatish</label>
        <input 
          type="datetime-local"
          value={lead.reminderDate ? lead.reminderDate.slice(0, 16) : ""}
          onChange={(e) => handleReminderChange(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          className="w-full bg-transparent text-[14px] text-orange-400 outline-none cursor-pointer"
        />
      </div>

      {(lead.address || lead.age) && (
        <div className="mb-2 p-2 bg-[#0f172a] rounded border border-gray-800 text-[11px] space-y-1">
          {lead.address && (
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Joy:</span>
              <span className="text-gray-300 truncate">{lead.address}</span>
            </div>
          )}
          {lead.age && (
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Yosh:</span>
              <span className="text-gray-300">{lead.age}</span>
            </div>
          )}
        </div>
      )}

      {(lead.utm_campaign || lead.utm_term) && (
        <div className="my-2 p-2 bg-[#0f172a] rounded border border-gray-800 text-[10px] space-y-1">
          <div className="flex justify-between gap-2 text-gray-400">
             <span>Camp:</span> <span className="text-orange-400 truncate">{lead.utm_campaign || '—'}</span>
          </div>
          <div className="flex justify-between gap-2 text-gray-400">
             <span>Creative:</span> <span className="text-purple-400 font-bold truncate">{lead.utm_term || '—'}</span>
          </div>
        </div>
      )}

      <div className="bg-[#0f172a] p-2 rounded mb-3">
        {!showHistory ? (
          displayComment ? (
            <p className="text-[11px] text-gray-400 italic line-clamp-2">{displayComment}</p>
          ) : (
            <p className="text-[11px] text-gray-600 italic">Izoh yo&apos;q</p>
          )
        ) : (
          <div className="max-h-32 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {lead.comments?.map((c, i) => (
              <div key={i} className="text-[11px] border-b border-gray-800 last:border-0 pb-1">
                <span className="text-[9px] text-gray-600 block">{new Date(c.createdAt).toLocaleTimeString()}</span>
                {c.text}
              </div>
            ))}
          </div>
        )}
        {lead.comments?.length > 0 && (
          <button onClick={() => setShowHistory(!showHistory)} className="w-full flex justify-center text-gray-600 hover:text-white pt-1">
            <svg className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="flex gap-1">
        <input 
          className="flex-1 bg-[#0f172a] border border-gray-700 rounded px-2 py-1 text-xs outline-none focus:border-blue-500" 
          placeholder="Komment..." 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)} 
          onPointerDown={(e) => e.stopPropagation()}
        />
        <button onClick={handleAddComment} disabled={loading} className="bg-gray-700 hover:bg-blue-600 px-3 py-1 rounded text-[10px] font-bold transition-colors">
          {loading ? "..." : "OK"}
        </button>
      </div>
    </div>
  );
};

// --- 4. Asosiy CRM Sahifasi (EXPORT DEFAULT) ---
export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminderAlert, setReminderAlert] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- OGOHLANTIRUV TIZIMI ---
  useEffect(() => {
    const interval = setInterval(() => {
      // O'zbekiston mahalliy vaqtini ISO formatiga yaqinlashtirib olish (YYYY-MM-DDTHH:mm)
      const now = new Date();
      const yil = now.getFullYear();
      const oy = String(now.getMonth() + 1).padStart(2, '0');
      const kun = String(now.getDate()).padStart(2, '0');
      const soat = String(now.getHours()).padStart(2, '0');
      const minut = String(now.getMinutes()).padStart(2, '0');
      
      const hozir = `${yil}-${oy}-${kun}T${soat}:${minut}`;
      
      leads.forEach(lead => {
        // Eslatma vaqti (YYYY-MM-DDTHH:mm) bilan Hozirgi vaqtni solishtirish
        if (lead.reminderDate && lead.reminderDate.slice(0, 16) === hozir) {
          setReminderAlert(lead);
          
          // Brauzer Notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`🔔 ESLATMA: ${lead.fullName}`, {
              body: `${lead.phone} bilan bog'lanish vaqti bo'ldi!`,
            });
          }
        }
      });
    }, 60000); // Har minutda tekshiradi

    return () => clearInterval(interval);
  }, [leads]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetch("/api/lead")
      .then(res => res.json())
      .then(data => {
        setLeads((data.leads || []).map((l: any) => ({ 
          ...l, 
          id: String(l._id || l.id),
          address: l.address || l.location || l.yashash_joyi, 
          age: l.age || l.yosh
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeLead = leads.find(l => l.id === activeId);
    const newStatus = STATUSES.includes(overId) ? overId : leads.find(l => l.id === overId)?.status;

    if (activeLead && newStatus && activeLead.status !== newStatus) {
      setLeads((prev) => prev.map(l => l.id === activeId ? { ...l, status: newStatus } : l));
      await fetch(`/api/lead/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    }
  };

  if (loading) return <div className="p-10 text-white text-center font-mono text-sm">Yuklanmoqda...</div>;

  return (
    <div className="min-h-screen bg-[#020617] p-4 relative custom-scrollbar">
      
      {/* OGOHLANTIRUV MODALI */}
      {reminderAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border-2 border-orange-500 p-8 rounded-2xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(249,115,22,0.4)]">
            <div className="text-6xl mb-4 animate-bounce">🔔</div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase">Vaqt bo&apos;ldi!</h2>
            <p className="text-orange-400 font-bold text-lg mb-1">{reminderAlert.fullName}</p>
            <p className="text-blue-400 mb-6 font-mono">{reminderAlert.phone}</p>
            <button 
              onClick={() => setReminderAlert(null)}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              TUSHUNDIM
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto select-none pb-6">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
        >
          {STATUSES.map(status => (
            <StatusColumn 
              key={status} 
              status={status} 
              count={leads.filter(l => l.status === status).length}
            >
              <SortableContext 
                items={leads.filter(l => l.status === status).map(l => l.id)} 
                strategy={verticalListSortingStrategy}
              >
                {leads
                  .filter(l => l.status === status)
                  .map(lead => <LeadCard key={lead.id} lead={lead} setLeads={setLeads} />)
                }
              </SortableContext>
            </StatusColumn>
          ))}

          <DragOverlay>
            {activeId ? (
              <LeadCard 
                lead={leads.find(l => l.id === activeId)!} 
                setLeads={setLeads} 
                isOverlay 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}