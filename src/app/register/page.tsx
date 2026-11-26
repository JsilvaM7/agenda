"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Cabeleireiro(a)",
  "Barbearia",
  "Mecânico",
  "Lojista",
  "Estética",
  "Manicure/Pedicure",
  "Dentista",
  "Personal Trainer",
  "Fotógrafo(a)",
  "Outro",
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    category: "",
    phone: "",
  });

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
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: slugify(form.businessName),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar conta");
      } else {
        toast.success("Conta criada! Faça login.");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-600">Agenda</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Crie sua conta gratuita</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? "bg-orange-400" : "bg-orange-100"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-8 animate-slide-up">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            {step === 1 ? "Seus dados" : "Sua empresa"}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {step === 1 ? "Passo 1 de 2" : "Passo 2 de 2"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Seu nome</label>
                  <input
                    type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Maria Silva"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} required minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition pr-12"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da empresa</label>
                  <input
                    type="text" required value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    placeholder="Salão da Maria"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition"
                  />
                  {form.businessName && (
                    <p className="text-xs text-orange-400 mt-1.5 font-medium">
                      🔗 Link: /b/{slugify(form.businessName)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                  <select
                    required value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 transition"
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefone <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3">
              {step === 2 && (
                <button
                  type="button" onClick={() => setStep(1)}
                  className="flex-1 border-2 border-orange-200 text-orange-500 font-bold py-3.5 rounded-xl hover:bg-orange-50 transition"
                >
                  Voltar
                </button>
              )}
              <button
                type="submit" disabled={loading}
                className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-500 hover:to-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Criando...</>
                ) : step === 1 ? (
                  "Próximo →"
                ) : (
                  "Criar conta"
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
