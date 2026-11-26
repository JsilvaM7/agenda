import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AdminInvoiceActions from "@/components/AdminInvoiceActions";
import { Receipt, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default async function AdminInvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/admin/login");

  const invoices = await prisma.invoice.findMany({
    include: { business: { include: { user: { select: { email: true } } } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const totalRevenueCents = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amountCents, 0);

  const pendingCents = invoices
    .filter((i) => i.status === "PENDING")
    .reduce((sum, i) => sum + i.amountCents, 0);

  const overdueCents = invoices
    .filter((i) => i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.amountCents, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Faturas</h1>
      <p className="text-gray-400 text-sm mb-8">
        R$1,00 por agendamento confirmado • Faturamento mensal
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
          <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            R$ {(totalRevenueCents / 100).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total recebido</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-5">
          <Receipt className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            R$ {(pendingCents / 100).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-400 mt-1">A receber</p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 p-5">
          <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">
            R$ {(overdueCents / 100).toFixed(2).replace(".", ",")}
          </p>
          <p className="text-xs text-gray-400 mt-1">Em atraso</p>
        </div>
      </div>

      {/* Tabela de faturas */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-700 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-500" /> Todas as Faturas
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {invoices.length === 0 ? (
            <p className="text-center text-gray-400 py-10">Nenhuma fatura gerada ainda</p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{inv.business.name}</p>
                  <p className="text-xs text-gray-400">{inv.business.user.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(inv.year, inv.month - 1), "MMMM yyyy", { locale: ptBR })} •{" "}
                    {inv.bookingCount} agendamentos • Vence em{" "}
                    {format(new Date(inv.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-gray-700 text-sm">
                    R$ {(inv.amountCents / 100).toFixed(2).replace(".", ",")}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    inv.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : inv.status === "OVERDUE"
                      ? "bg-red-100 text-red-600"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {inv.status === "PAID" ? "✓ Pago" : inv.status === "OVERDUE" ? "⚠ Vencida" : "⏳ Pendente"}
                  </span>
                  {inv.status !== "PAID" && (
                    <AdminInvoiceActions
                      invoiceId={inv.id}
                      businessId={inv.businessId}
                      currentStatus={inv.status}
                      isSuspended={inv.business.suspended}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
