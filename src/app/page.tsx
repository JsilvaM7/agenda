"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: form.identifier,
        password: form.password,
        isAdmin: "false",
        redirect: false,
      });
      if (res?.error) {
        toast.error("Nome ou senha incorretos");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  }

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
            <input
              type="text"
              required
              autoComplete="username"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              placeholder="Nome do serviço"
              className="w-full px-4 py-4 rounded-2xl border-2 border-orange-100 focus:outline-none focus:border-orange-400 bg-orange-50/40 text-gray-800 placeholder-gray-300 text-base transition font-medium"
            />

            {/* Senha com olhinho como marca d'água */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Senha"
                className="w-full px-4 py-4 pr-14 rounded-2xl border-2 border-orange-100 focus:outline-none focus:border-orange-400 bg-orange-50/40 text-gray-800 placeholder-gray-300 text-base transition font-medium"
              />
              {/* Olhinho como marca d'água — só aparece quando o campo está vazio */}
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

            {/* Botão entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition text-base flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
                : "Entrar"}
            </button>
          </form>
        </div>

        {/* Criar conta */}
        <p className="text-center mt-6 text-sm text-gray-400">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="text-orange-500 font-bold hover:text-orange-600 transition"
          >
            Criar conta
          </Link>
        </p>

      </div>
    </main>
  );
}
