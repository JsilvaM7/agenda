"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import { format, isBefore, startOfDay } from "date-fns";
import { Calendar, Clock, Phone, User, MessageSquare, ChevronLeft, ChevronRight, CheckCircle, Loader2, Camera } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import "react-day-picker/dist/style.css";

interface Business {
  id: string;
  name: string;
  description?: string;
  category?: string;
  photos: { id: string; url: string }[];
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

type Step = "calendar" | "time" | "form" | "success";

export default function BookingPage() {
  const { slug } = useParams() as { slug: string };
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<Step>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [message, setMessage] = useState("");

  // Galeria de fotos
  const [photoIndex, setPhotoIndex] = useState(0);

  // Busca dados da empresa
  useEffect(() => {
    async function fetchBusiness() {
      try {
        const res = await fetch(`/api/businesses/${slug}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setBusiness(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchBusiness();
  }, [slug]);

  // Auto-avança foto a cada 4 segundos
  useEffect(() => {
    if (!business?.photos?.length || business.photos.length <= 1) return;
    const timer = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % business.photos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [business?.photos?.length]);

  // Busca horários disponíveis quando data é selecionada
  const fetchSlots = useCallback(async (date: Date) => {
    setSlotsLoading(true);
    setSlots([]);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/businesses/${slug}/availability?date=${dateStr}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      toast.error("Erro ao carregar horários");
    } finally {
      setSlotsLoading(false);
    }
  }, [slug]);

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchSlots(date);
    setStep("time");
  }

  async function handleBooking() {
    if (!business || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      const bookingDate = new Date(selectedDate);
      const [h, m] = selectedSlot.startTime.split(":").map(Number);
      bookingDate.setHours(h, m, 0, 0);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          timeSlotId: selectedSlot.id,
          date: bookingDate.toISOString(),
          clientName: clientName.trim() || null,
          clientPhone: clientPhone.trim() || null,
          message: message.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao realizar agendamento");
        if (res.status === 409) {
          // Horário foi tomado, recarrega slots
          fetchSlots(selectedDate);
          setStep("time");
        }
      } else {
        setStep("success");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 p-4 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-700 mb-2">Agenda não encontrada</h1>
        <p className="text-gray-400">Verifique o link e tente novamente.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-6 shadow-lg">
        <div className="max-w-lg mx-auto">
          {/* Galeria de Fotos */}
          {business.photos.length > 0 && (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-5 shadow-xl">
              <Image
                src={business.photos[photoIndex].url}
                alt={`Foto ${photoIndex + 1} - ${business.name}`}
                fill
                className="object-cover transition-all duration-700"
              />
              {/* Overlay escuro suave */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

              {/* Controles da galeria */}
              {business.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIndex((i) => (i - 1 + business.photos.length) % business.photos.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setPhotoIndex((i) => (i + 1) % business.photos.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center hover:bg-black/60 transition"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>

                  {/* Pontos indicadores */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {business.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === photoIndex ? "bg-white w-4" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Contador */}
                  <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {photoIndex + 1}/{business.photos.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Info da empresa */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-2">
              <Calendar className="w-3.5 h-3.5" />
              {business.category || "Agendamento Online"}
            </div>
            <h1 className="text-2xl font-bold">{business.name}</h1>
            {business.description && (
              <p className="text-orange-100 text-sm mt-1">{business.description}</p>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Steps indicator */}
        {step !== "success" && (
          <div className="flex items-center gap-2 mb-6">
            {[
              { key: "calendar", label: "Data" },
              { key: "time", label: "Horário" },
              { key: "form", label: "Dados" },
            ].map((s, i) => {
              const steps = ["calendar", "time", "form"];
              const currentIdx = steps.indexOf(step);
              const isActive = s.key === step;
              const isDone = steps.indexOf(s.key) < currentIdx;

              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className={`flex items-center gap-1.5 flex-1 ${i > 0 ? "" : ""}`}>
                    {i > 0 && (
                      <div className={`h-0.5 flex-1 ${isDone || isActive ? "bg-orange-400" : "bg-orange-100"}`} />
                    )}
                    <div className={`flex items-center gap-1 ${isActive ? "text-orange-600 font-bold" : isDone ? "text-orange-400" : "text-gray-300"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? "bg-orange-400 text-white" : isDone ? "bg-orange-200 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <span className="text-xs hidden sm:block">{s.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 1: Calendário */}
        {step === "calendar" && (
          <div className="animate-slide-up">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Escolha uma data</h2>
            <p className="text-gray-400 text-sm mb-5">Selecione o dia que deseja agendar</p>
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4 flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                disabled={[{ before: startOfDay(new Date()) }]}
                modifiersClassNames={{ selected: "rdp-day_selected", today: "rdp-day_today" }}
                className="rdp"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Horários */}
        {step === "time" && selectedDate && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep("calendar")}
              className="flex items-center gap-1 text-orange-500 font-medium text-sm mb-4 hover:text-orange-600"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Escolha um horário</h2>
            <p className="text-gray-400 text-sm mb-5">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>

            {slotsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-orange-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Sem horários disponíveis</p>
                <p className="text-gray-400 text-sm mt-1">Escolha outra data</p>
                <button
                  onClick={() => setStep("calendar")}
                  className="mt-4 text-orange-500 font-semibold text-sm"
                >
                  Voltar ao calendário
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                        !slot.available
                          ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                          : selectedSlot?.id === slot.id
                          ? "bg-orange-400 text-white border-orange-400 shadow-md shadow-orange-200 scale-105"
                          : "bg-white text-gray-700 border-orange-100 hover:border-orange-300 hover:bg-orange-50"
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <button
                    onClick={() => setStep("form")}
                    className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-4 rounded-2xl hover:from-orange-500 hover:to-orange-600 transition shadow-lg shadow-orange-200"
                  >
                    Continuar com {selectedSlot.startTime} →
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 3: Formulário */}
        {step === "form" && selectedDate && selectedSlot && (
          <div className="animate-slide-up">
            <button
              onClick={() => setStep("time")}
              className="flex items-center gap-1 text-orange-500 font-medium text-sm mb-4 hover:text-orange-600"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>

            {/* Resumo */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-orange-600 font-semibold text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedSlot.startTime} — {selectedSlot.endTime}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">Seus dados</h2>
            <p className="text-gray-400 text-sm mb-5">Campos opcionais — preencha se quiser</p>

            <div className="space-y-4">
              {/* Nome */}
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-orange-300 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome (opcional)"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-800 placeholder-gray-300 transition"
                />
              </div>

              {/* Telefone */}
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-orange-300 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Seu número (opcional)"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-800 placeholder-gray-300 transition"
                />
              </div>

              {/* Mensagem */}
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-orange-300 pointer-events-none" style={{width:"18px",height:"18px"}} />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Mensagem para ${business.name} (opcional)`}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-gray-800 placeholder-gray-300 transition resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={submitting}
              className="w-full mt-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-4 rounded-2xl hover:from-orange-500 hover:to-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Agendando...</>
              ) : (
                "Confirmar Agendamento ✓"
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Ao confirmar, o(a) {business.name} será notificado(a)
            </p>
          </div>
        )}

        {/* STEP 4: Sucesso */}
        {step === "success" && selectedDate && selectedSlot && (
          <div className="animate-slide-up text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Agendado! 🎉</h2>
            <p className="text-gray-500 mb-6">Seu agendamento foi confirmado com sucesso.</p>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 text-left mb-8">
              <h3 className="font-bold text-gray-700 mb-3">Detalhes do agendamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  <span>{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>{selectedSlot.startTime} — {selectedSlot.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-orange-400" />
                  <span>{business.name}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setStep("calendar");
                setSelectedDate(undefined);
                setSelectedSlot(null);
                setClientName("");
                setClientPhone("");
                setMessage("");
              }}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold px-8 py-3.5 rounded-2xl hover:from-orange-500 hover:to-orange-600 transition shadow-lg shadow-orange-200"
            >
              Fazer outro agendamento
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 mt-4">
        <p className="text-xs text-gray-300">
          Powered by{" "}
          <span className="text-orange-400 font-semibold">Agenda</span>
        </p>
      </div>
    </main>
  );
}
