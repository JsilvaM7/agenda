import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Clock, Users, ExternalLink, TrendingUp, AlertCircle, CheckCircle, XCircle, Info, Bell } from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import CopyLinkButton from "@/components/CopyLinkButton";
import PushNotificationManager from "@/components/PushNotificationManager";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const business = await prisma.business.findUnique({
    where: { userId },
    include: {
      bookings: {
        include: { timeSlot: true },
        orderBy: { date: "desc" },
        take: 10,
      },
      photos: true,
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: { select: { bookings: true } },
    },
  });

  if (!business) redirect("/login");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Agendamentos do mês atual (confirmados, não cancelados)
  const thisMonthBookings = await prisma.booking.count({
    where: {
      businessId: business.id,
      status: "CONFIRMED",
      date: { gte: monthStart, lte: monthEnd },
    },
  });

  // Fatura do mês atual (se existir)
  const currentInvoice = business.invoices.find(
    (inv) => inv.month === now.getMonth() + 1 && inv.year === now.getFullYear()
  );

  // Fatura em atraso (OVERDUE)
  const overdueInvoice = business.invoices.find(
    (inv) => inv.status === "OVERDUE"
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayBookings = business.bookings.filter((b) => {
    const d = new Date(b.date);
    return d >= today && d < tomorrow && b.status !== "CANCELLED";
  }).length;

  const upcoming = business.bookings.filter(
    (b) => new Date(b.date) >= today && b.status !== "CANCELLED"
  ).length;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenda-e-dolphin.com";
  const publicLink = `${baseUrl}/b/${business.slug}`;

  const stats = [
    {
      icon: <Calendar className="w-5 h-5 text-orange-500" />,
      label: "Total de agendamentos",
      value: business._count.bookings,
      bg: "bg-orange-50",
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      label: "Hoje",
      value: todayBookings,
      bg: "bg-blue-50",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
      label: "Próximos",
      value: upcoming,
      bg: "bg-green-50",
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      label: "Fotos",
      value: `${business.photos.length}/30`,
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">

      {/* ====================== BANNER CONTA SUSPENSA ====================== */}
      {business.suspended && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex items-start gap-4">
          <XCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 text-lg">⛔ Conta pausada por inadimplência</p>
            <p className="text-red-600 text-sm mt-1">
              Sua conta está suspensa. Sua página de agendamento está{" "}
              <strong>offline</strong> e clientes não conseguem agendar.
            </p>
            <p className="text-red-500 text-sm mt-2">
              Para reativar, pague a fatura pendente e entre em contato via{" "}
              <strong>suporte@agenda-e-dolphin.com</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ====================== BANNER FATURA VENCIDA ====================== */}
      {overdueInvoice && !business.suspended && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-orange-700">⚠️ Fatura em atraso!</p>
            <p className="text-orange-600 text-sm mt-1">
              Você tem uma fatura de{" "}
              <strong>R$ {(overdueInvoice.amountCents / 100).toFixed(2).replace(".", ",")}</strong>{" "}
              ({overdueInvoice.bookingCount} agendamentos em{" "}
              {format(new Date(overdueInvoice.year, overdueInvoice.month - 1), "MMMM/yyyy", { locale: ptBR })}) vencida.
            </p>
            <p className="text-orange-500 text-sm mt-1">
              Se não paga em breve, sua conta será <strong>pausada automaticamente</strong>.
            </p>
            <p className="text-orange-500 text-sm mt-1 font-medium">
              Entre em contato: suporte@agenda-e-dolphin.com
            </p>
          </div>
        </div>
      )}

      {/* ====================== CARD DE FATURAMENTO DO MÊS ====================== */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-white/80 flex-shrink-0" />
          <div>
            <p className="text-white font-bold">Cobrança do plano Agenda</p>
            <p className="text-orange-100 text-xs">
              Cada agendamento realizado custa <strong className="text-white">R$ 1,00</strong> —
              cobrado no final do mês
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Mês atual */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-orange-500 font-semibold uppercase tracking-wide mb-1">
                {format(now, "MMMM yyyy", { locale: ptBR })}
              </p>
              <p className="text-3xl font-extrabold text-gray-800">
                {thisMonthBookings}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">agendamentos</p>
              <div className="mt-3 pt-3 border-t border-orange-100">
                <p className="text-xs text-gray-400">Valor estimado</p>
                <p className="text-xl font-bold text-orange-500">
                  R$ {thisMonthBookings.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </div>

            {/* Status da fatura atual */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">
                Status da fatura
              </p>
              {currentInvoice ? (
                <>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mt-1 ${
                    currentInvoice.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : currentInvoice.status === "OVERDUE"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {currentInvoice.status === "PAID" ? (
                      <><CheckCircle className="w-4 h-4" /> Pago</>
                    ) : currentInvoice.status === "OVERDUE" ? (
                      <><XCircle className="w-4 h-4" /> Vencida</>
                    ) : (
                      <><AlertCircle className="w-4 h-4" /> Pendente</>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Vence em:{" "}
                    {format(new Date(currentInvoice.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mt-1 bg-green-100 text-green-700">
                    <CheckCircle className="w-4 h-4" /> Em dia
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Fatura gerada no final do mês
                  </p>
                </>
              )}
            </div>

            {/* Regras */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                Como funciona
              </p>
              <ul className="space-y-2 text-xs text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold flex-shrink-0">R$1</span>
                  por agendamento confirmado
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold flex-shrink-0">📅</span>
                  Fatura gerada no último dia do mês
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold flex-shrink-0">💳</span>
                  Pagamento via PIX ou transferência
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold flex-shrink-0">⛔</span>
                  Sem pagamento = conta pausada
                </li>
              </ul>
              <a
                href="mailto:suporte@agenda-e-dolphin.com"
                className="mt-3 text-xs text-orange-500 font-medium hover:text-orange-600 block"
              >
                suporte@agenda-e-dolphin.com →
              </a>
            </div>
          </div>

          {/* Histórico de faturas */}
          {business.invoices.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                Histórico de faturas
              </p>
              <div className="space-y-2">
                {business.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div>
                      <span className="text-sm font-semibold text-gray-700">
                        {format(new Date(inv.year, inv.month - 1), "MMMM yyyy", { locale: ptBR })}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {inv.bookingCount} agendamentos
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">
                        R$ {(inv.amountCents / 100).toFixed(2).replace(".", ",")}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        inv.status === "PAID"
                          ? "bg-green-100 text-green-600"
                          : inv.status === "OVERDUE"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}>
                        {inv.status === "PAID" ? "✓ Pago" : inv.status === "OVERDUE" ? "Vencida" : "Pendente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================== BOAS VINDAS + LINK ====================== */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Olá, {session!.user!.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Visão geral do{" "}
            <span className="font-semibold text-orange-500">{business.name}</span>
          </p>
        </div>
        <Link
          href={`/b/${business.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:from-orange-500 hover:to-orange-600 transition shadow-md shadow-orange-200 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Ver minha página
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-orange-100 p-5 shadow-sm hover:shadow-md transition"
          >
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Link da agenda */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-200">
        <p className="text-sm font-medium text-orange-100 mb-2">
          🔗 Seu link de agendamento — compartilhe com seus clientes!
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="bg-white/20 px-3 py-1.5 rounded-xl text-sm font-mono break-all flex-1">
            {publicLink}
          </code>
          <CopyLinkButton link={publicLink} />
        </div>
      </div>

      {/* Notificações push (100% próprio, sem Firebase) */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-orange-400" />
          <h2 className="font-bold text-gray-800">Notificações no Celular</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Ative para receber aviso quando alguém agendar e 30 minutos antes do horário.
          Funciona direto pelo navegador — sem precisar de nenhum app externo.
        </p>
        <PushNotificationManager />
      </div>

      {/* Agendamentos recentes */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm">
        <div className="p-5 border-b border-orange-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Agendamentos Recentes</h2>
          <Link
            href="/dashboard/bookings"
            className="text-orange-500 text-sm font-medium hover:text-orange-600"
          >
            Ver todos →
          </Link>
        </div>

        {business.bookings.length === 0 ? (
          <div className="p-10 text-center">
            <Calendar className="w-12 h-12 text-orange-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum agendamento ainda</p>
            <p className="text-gray-400 text-sm mt-1">
              Compartilhe seu link para começar a receber agendamentos!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-orange-50">
            {business.bookings.slice(0, 8).map((booking) => (
              <div
                key={booking.id}
                className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-orange-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {booking.clientName || "Cliente anônimo"}
                    </p>
                    {booking.clientPhone && (
                      <p className="text-xs text-gray-400">{booking.clientPhone}</p>
                    )}
                    {booking.message && (
                      <p className="text-xs text-gray-400 italic truncate max-w-[200px]">
                        "{booking.message}"
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-700">
                    {format(new Date(booking.date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <p className="text-xs text-orange-500 font-medium">
                    {booking.timeSlot.startTime} — {booking.timeSlot.endTime}
                  </p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                      booking.status === "CONFIRMED"
                        ? "bg-green-100 text-green-600"
                        : booking.status === "CANCELLED"
                        ? "bg-red-100 text-red-500"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {booking.status === "CONFIRMED"
                      ? "Confirmado"
                      : booking.status === "CANCELLED"
                      ? "Cancelado"
                      : "Pendente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
