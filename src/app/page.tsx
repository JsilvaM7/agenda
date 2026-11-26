"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    <main className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="w-full max-w-xs flex flex-col items-center gap-6">

        {/* Logo */}
        <h1 className="text-5xl font-extrabold text-orange-500 tracking-tight">
          Agenda
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Nome */}
          <input
            type="text"
            required
            value={form.identifier}
            onChange={(e) => setForm({ ...form, identifier: e.target.value })}
            placeholder="Nome do serviço"
            className="w-full px-4 py-3.5 rounded-2xl border-2 border-orange-200 focus:outline-none focus:border-orange-400 bg-white text-gray-800 placeholder-gray-400 text-base transition"
          />

          {/* Senha */}
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Senha"
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-orange-200 focus:outline-none focus:border-orange-400 bg-white text-gray-800 placeholder-gray-400 text-base transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition text-base flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-orange-200"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</> : "Entrar"}
          </button>
        </form>

        {/* Link criar conta */}
        <Link
          href="/register"
          className="text-sm text-orange-500 hover:text-orange-600 font-semibold transition"
        >
          Criar conta
        </Link>

      </div>
    </main>
  );
}
