import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import AdminToggleActive from "@/components/AdminToggleActive";
import { ArrowLeft, Calendar, Users, ExternalLink } from "lucide-react";

export default async function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/admin/login");

  const { id } = await params;

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      user: true,
      photos: { orderBy: { order: "asc" } },
      _count: { select: { bookings: true } },
      bookings: {
        include: { timeSlot: true },
        orderBy: { date: "desc" },
        take: 20,
      },
    },
  });

  if (!business) notFound();

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{business!.name}</h1>
          <p className="text-gray-400 text-sm mt-1">{business!.user.email} • /{business!.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/b/${business!.slug}`}
            target="_blank"
            className="flex items-center gap-2 border border-orange-200 text-orange-600 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-orange-50 transition"
          >
            <ExternalLink className="w-4 h-4" /> Ver página
          </Link>
          <AdminToggleActive businessId={business!.id} active={business!.active} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: <Calendar className="w-5 h-5 text-orange-500" />, label: "Agendamentos", value: business!._count.bookings },
          { icon: <Users className="w-5 h-5 text-blue-500" />, label: "Fotos", value: business!.photos.length },
          { icon: <Users className="w-5 h-5 text-green-500" />, label: "Status", value: business!.active ? "Ativo" : "Inativo" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="mb-3">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-700">Agendamentos</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {business!.bookings.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Sem agendamentos</p>
          ) : (
            business!.bookings.map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-700 text-sm">{b.clientName || "Anônimo"}</p>
                  {b.clientPhone && <p className="text-xs text-gray-400">{b.clientPhone}</p>}
                  {b.message && <p className="text-xs text-gray-400 italic">"{b.message}"</p>}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p className="font-semibold">{format(new Date(b.date), "dd/MM/yyyy", { locale: ptBR })}</p>
                  <p className="text-orange-500">{b.timeSlot.startTime}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    b.status === "CONFIRMED" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                  }`}>
                    {b.status === "CONFIRMED" ? "Confirmado" : b.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
