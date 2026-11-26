"use client";

import { useState, useEffect } from "react";
import { Clock, Save, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function SettingsPage() {
  const [slots, setSlots]               = useState<TimeSlot[]>([]);
  const [saving, setSaving]             = useState(false);
  const [tab, setTab]                   = useState<"schedule" | "profile">("schedule");
  const [description, setDescription]  = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    const [slotsRes, profileRes] = await Promise.all([
      fetch("/api/dashboard/slots"),
      fetch("/api/dashboard/profile"),
    ]);
    if (slotsRes.ok)   setSlots(await slotsRes.json());
    if (profileRes.ok) {
      const p = await profileRes.json();
      setDescription(p.description || "");
      setBusinessPhone(p.phone || "");
    }
  }

  function toggleSlot(id: string) {
    setSlots((s) => s.map((slot) => slot.id === id ? { ...slot, active: !slot.active } : slot));
  }

  async function saveSlots() {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (res.ok) toast.success("Horários salvos!");
      else toast.error("Erro ao salvar horários");
    } finally { setSaving(false); }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, phone: businessPhone }),
      });
      if (res.ok) toast.success("Perfil atualizado!");
      else toast.error("Erro ao salvar");
    } finally { setSaving(false); }
  }

  const slotsByDay = DAYS.reduce<Record<number, TimeSlot[]>>((acc, _, i) => {
    acc[i] = slots.filter((s) => s.dayOfWeek === i);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-orange-100">
        {[
          { key: "schedule", label: "🕐 Horários" },
          { key: "profile",  label: "🏪 Perfil" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === t.key
                ? "border-orange-400 text-orange-600"
                : "border-transparent text-gray-400 hover:text-orange-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Horários */}
      {tab === "schedule" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-700">Horários Disponíveis</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Ative/desative os horários que você atende
              </p>
            </div>
            <button
              onClick={saveSlots}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:from-orange-500 hover:to-orange-600 transition disabled:opacity-50 text-sm shadow-md shadow-orange-100"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </button>
          </div>

          <div className="space-y-4">
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="font-semibold text-gray-700">{day}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    {slotsByDay[dayIdx]?.filter((s) => s.active).length || 0} horários ativos
                  </span>
                </div>
                {!slotsByDay[dayIdx]?.length ? (
                  <p className="text-center text-gray-400 text-sm py-3">
                    Sem horários configurados
                  </p>
                ) : (
                  <div className="p-4 flex flex-wrap gap-2">
                    {slotsByDay[dayIdx].map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => toggleSlot(slot.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border-2 ${
                          slot.active
                            ? "bg-orange-400 text-white border-orange-400"
                            : "bg-gray-50 text-gray-400 border-gray-200"
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Perfil */}
      {tab === "profile" && (
        <div className="max-w-lg">
          <h2 className="font-bold text-gray-700 mb-5">Informações da Empresa</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu negócio para os clientes..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Telefone de contato
              </label>
              <input
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400"
              />
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-500 hover:to-orange-600 transition disabled:opacity-50 shadow-md shadow-orange-100"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle className="w-4 h-4" />}
              Salvar alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
