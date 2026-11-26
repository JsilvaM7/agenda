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
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  }

  const slug = slugify(form.businessName);

  const inputStyle = {
    width: "100%",
    padding: "1rem 1.25rem",
    borderRadius: 16,
    border: "2px solid #fed7aa",
    background: "rgba(255,247,237,0.5)",
    fontSize: "1rem",
    fontWeight: 500,
    color: "#1f2937",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffffff 50%, #ffedd5 100%)",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "360px" }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2.5rem" }}>
          <div
            style={{
              width: 64, height: 64,
              borderRadius: 20,
              background: "linear-gradient(135deg, #fb923c, #ea580c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 20px 40px rgba(251,146,60,0.35)",
              marginBottom: "1rem",
            }}
          >
            <Calendar style={{ width: 36, height: 36, color: "white" }} />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#f97316", letterSpacing: "-1px", margin: 0 }}>
            Agenda
          </h1>
        </div>

        {/* Card */}
        <div
          style={{
            background: "white",
            borderRadius: 24,
            boxShadow: "0 25px 60px rgba(251,146,60,0.12), 0 4px 16px rgba(0,0,0,0.06)",
            border: "1.5px solid #fed7aa",
            padding: "2rem",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Nome do serviço */}
            <div>
              <input
                type="text"
                required
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Nome do serviço"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#fb923c")}
                onBlur={(e) => (e.target.style.borderColor = "#fed7aa")}
              />
              {form.businessName && slug && (
                <p style={{ margin: "6px 0 0 4px", fontSize: "0.75rem", color: "#fb923c", fontWeight: 600 }}>
                  🔗 /b/{slug}
                </p>
              )}
            </div>

            {/* Senha */}
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Senha"
                style={{ ...inputStyle, paddingRight: "3.5rem" }}
                onFocus={(e) => (e.target.style.borderColor = "#fb923c")}
                onBlur={(e) => (e.target.style.borderColor = "#fed7aa")}
              />
              {!form.password ? (
                <Eye
                  style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    width: 20, height: 20, color: "#d1d5db", pointerEvents: "none",
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0,
                  }}
                >
                  {showPass
                    ? <EyeOff style={{ width: 20, height: 20 }} />
                    : <Eye style={{ width: 20, height: 20 }} />}
                </button>
              )}
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: 16,
                border: "none",
                background: loading ? "#fdba74" : "linear-gradient(135deg, #fb923c, #f97316)",
                color: "white",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 24px rgba(251,146,60,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.25rem",
                fontFamily: "inherit",
              }}
            >
              {loading
                ? <><Loader2 style={{ width: 20, height: 20 }} /> Criando...</>
                : "Criar conta"}
            </button>
          </form>
        </div>

        {/* Link entrar */}
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
          Já tem conta?{" "}
          <Link href="/" style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}>
            Entrar
          </Link>
        </p>

      </div>
    </div>
  );
}
