import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users, Calendar, ExternalLink, ChevronRight } from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/admin/login");

  const businesses = await prisma.business.findMany({
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalBookings = await prisma.booking.count();
  const totalUsers = await prisma.user.count();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie todos os comerciantes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Comerciantes", value: totalUsers, icon: "🏪" },
          { label: "Total Agendamentos", value: totalBookings, icon: "📅" },
          { label: "Empresas Ativas", value: businesses.filter((b) => b.active).length, icon: "✅" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-2xl mb-1">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista de comerciantes */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" /> Comerciantes Cadastrados
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {businesses.map((biz) => (
            <div key={biz.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-800">{biz.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${biz.active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                    {biz.active ? "Ativo" : "Inativo"}
                  </span>
                  {biz.category && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {biz.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{biz.user.email}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span>📅 {biz._count.bookings} agendamentos</span>
                  <span>Desde {format(new Date(biz.user.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/b/${biz.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition"
                  title="Ver página pública"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <Link
                  href={`/admin/merchant/${biz.id}`}
                  className="flex items-center gap-1 bg-orange-50 text-orange-600 font-semibold text-sm px-3 py-2 rounded-xl hover:bg-orange-100 transition"
                >
                  Detalhes <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
