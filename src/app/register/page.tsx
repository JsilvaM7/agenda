"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ businessName: "", password: "" });

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar conta");
      } else {
        toast.success("Conta criada!");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  const slug = slugify(form.businessName);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200 mb-4">
            <Calendar className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-orange-500 tracking-tight">
            Agenda
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-orange-100 border border-orange-100 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nome do serviço */}
            <div>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Nome do serviço"
                className="w-full px-4 py-4 rounded-2xl border-2 border-orange-100 focus:outline-none focus:border-orange-400 bg-orange-50/40 text-gray-800 placeholder-gray-300 text-base transition font-medium"
              />
              {form.businessName && slug && (
                <p className="text-xs text-orange-400 mt-1.5 ml-1 font-medium">
                  🔗 /b/{slug}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Senha"
                className="w-full px-4 py-4 pr-14 rounded-2xl border-2 border-orange-100 focus:outline-none focus:border-orange-400 bg-orange-50/40 text-gray-800 placeholder-gray-300 text-base transition font-medium"
              />
              {!form.password ? (
                <Eye className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-200 pointer-events-none" />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition text-base flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Criando...</>
                : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Já tem conta?{" "}
          <Link href="/" className="text-orange-500 font-bold hover:text-orange-600 transition">
            Entrar
          </Link>
        </p>

      </div>
    </main>
  );
}
