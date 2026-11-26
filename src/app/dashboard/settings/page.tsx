"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Plus, Loader2, GripVertical, Image as ImageIcon, Clock, Save, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Photo {
  id: string;
  url: string;
}

interface TimeSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"photos" | "schedule" | "profile">("photos");
  const [description, setDescription] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [photosRes, slotsRes, profileRes] = await Promise.all([
      fetch("/api/dashboard/photos"),
      fetch("/api/dashboard/slots"),
      fetch("/api/dashboard/profile"),
    ]);
    if (photosRes.ok) setPhotos(await photosRes.json());
    if (slotsRes.ok) setSlots(await slotsRes.json());
    if (profileRes.ok) {
      const p = await profileRes.json();
      setDescription(p.description || "");
      setBusinessPhone(p.phone || "");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 30) {
      toast.error("Limite de 30 fotos atingido");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/photos", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Erro no upload");
      else { toast.success("Foto adicionada!"); setPhotos((p) => [...p, data.photo]); }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDeletePhoto(id: string) {
    if (!confirm("Remover esta foto?")) return;
    const res = await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setPhotos((p) => p.filter((ph) => ph.id !== id));
      toast.success("Foto removida");
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
    } finally {
      setSaving(false);
    }
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
    } finally {
      setSaving(false);
    }
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
          { key: "photos", label: "📸 Fotos", },
          { key: "schedule", label: "🕐 Horários", },
          { key: "profile", label: "🏪 Perfil", },
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

      {/* TAB: Fotos */}
      {tab === "photos" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-700">Galeria de Fotos</h2>
              <p className="text-xs text-gray-400 mt-0.5">{photos.length}/30 fotos • Exibidas em carrossel para clientes</p>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || photos.length >= 30}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:from-orange-500 hover:to-orange-600 transition disabled:opacity-50 text-sm shadow-md shadow-orange-100"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Adicionar foto
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </div>

          {photos.length === 0 ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-orange-200 rounded-2xl p-16 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition"
            >
              <ImageIcon className="w-12 h-12 text-orange-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Clique para adicionar fotos</p>
              <p className="text-gray-400 text-sm mt-1">Até 30 fotos • JPG, PNG, WebP • Máx 5MB</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
                  <Image src={photo.url} alt={`Foto ${i + 1}`} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/40 text-white text-xs px-1.5 py-0.5 rounded-lg">
                    {i + 1}
                  </div>
                </div>
              ))}
              {photos.length < 30 && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition"
                >
                  <Plus className="w-6 h-6 text-orange-300" />
                  <span className="text-xs text-orange-300 mt-1">Adicionar</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB: Horários */}
      {tab === "schedule" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-700">Horários Disponíveis</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ative/desative os horários que você atende</p>
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
                {slotsByDay[dayIdx]?.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-3">Sem horários configurados</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva seu negócio para os clientes..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone de contato</label>
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
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Salvar alterações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
