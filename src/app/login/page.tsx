"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        isAdmin: "false",
        redirect: false,
      });
      if (res?.error) {
        toast.error("Email ou senha incorretos");
      } else {
        toast.success("Bem-vindo!");
        router.push("/dashboard");
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
          <p className="text-gray-500 mt-2 text-sm">Acesse sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-8 animate-slide-up">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Entrar</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Sua senha"
                  className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 bg-orange-50/30 text-gray-800 placeholder-gray-400 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3.5 rounded-xl hover:from-orange-500 hover:to-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-orange-500 font-semibold hover:text-orange-600">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
