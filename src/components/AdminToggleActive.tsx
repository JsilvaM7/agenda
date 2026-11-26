"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function AdminToggleActive({
  businessId,
  active,
}: {
  businessId: string;
  active: boolean;
}) {
  const [isActive, setIsActive] = useState(active);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${businessId}/toggle`, {
        method: "PUT",
      });
      if (res.ok) {
        setIsActive((v) => !v);
        toast.success(isActive ? "Conta desativada" : "Conta ativada");
      } else {
        toast.error("Erro ao alterar status");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition ${
        isActive
          ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
          : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
      } disabled:opacity-50`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {isActive ? "Desativar conta" : "Ativar conta"}
    </button>
  );
}
