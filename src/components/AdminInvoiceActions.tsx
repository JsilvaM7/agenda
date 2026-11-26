"use client";

import { useState } from "react";
import { Loader2, CheckCircle, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminInvoiceActions({
  invoiceId,
  businessId,
  currentStatus,
  isSuspended,
}: {
  invoiceId: string;
  businessId: string;
  currentStatus: string;
  isSuspended: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [suspended, setSuspended] = useState(isSuspended);

  async function markPaid() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/pay`, { method: "PUT" });
      if (res.ok) {
        setStatus("PAID");
        setSuspended(false);
        toast.success("Fatura marcada como paga e conta reativada!");
      } else toast.error("Erro ao marcar como pago");
    } finally { setLoading(false); }
  }

  async function reactivate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/toggle`, { method: "PUT" });
      if (res.ok) { setSuspended(false); toast.success("Conta reativada!"); }
      else toast.error("Erro ao reativar conta");
    } finally { setLoading(false); }
  }

  if (status === "PAID") return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={markPaid}
        disabled={loading}
        className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 font-semibold text-xs px-3 py-1.5 rounded-xl hover:bg-green-100 transition disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        Marcar pago
      </button>
      {suspended && (
        <button
          onClick={reactivate}
          disabled={loading}
          className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-xs px-3 py-1.5 rounded-xl hover:bg-blue-100 transition disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" />
          Reativar
        </button>
      )}
    </div>
  );
}
