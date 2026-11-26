"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        isAdmin: "true",
        redirect: false,
      });
      if (res?.error) toast.error("Credenciais inválidas");
      else { toast.success("Acesso concedido"); router.push("/admin"); }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-900/40">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin — Agenda</h1>
          <p className="text-gray-400 text-sm mt-1">Acesso restrito</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@agenda.com"
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Senha</label>
              <input
                type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Senha de administrador"
                className="w-full px-4 py-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
