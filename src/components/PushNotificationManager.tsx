"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function PushNotificationManager() {
  const [status, setStatus] = useState<"loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed">("loading");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    const perm = Notification.permission;
    if (perm === "denied") { setStatus("denied"); return; }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setStatus(sub ? "subscribed" : "unsubscribed");
  }

  async function subscribe() {
    setLoading(true);
    try {
      // Registra o service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Pede permissão ao usuário
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus("denied");
        toast.error("Permissão de notificação negada");
        return;
      }

      // Busca a chave pública VAPID do próprio servidor
      const res = await fetch("/api/notifications/subscribe");
      const { publicKey } = await res.json();

      // Inscreve no navegador
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Envia a subscription para o banco de dados
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setStatus("subscribed");
      toast.success("🔔 Notificações ativadas!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao ativar notificações");
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await fetch("/api/notifications/subscribe", { method: "DELETE" });
      setStatus("unsubscribed");
      toast.success("Notificações desativadas");
    } catch {
      toast.error("Erro ao desativar");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return null;

  if (status === "unsupported") {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
        <BellOff className="w-4 h-4" />
        Notificações push não suportadas neste navegador
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100">
        <BellOff className="w-4 h-4" />
        Notificações bloqueadas — permita nas configurações do navegador
      </div>
    );
  }

  if (status === "subscribed") {
    return (
      <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Notificações push ativadas</span>
        </div>
        <button
          onClick={unsubscribe}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-red-500 transition font-medium"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Desativar"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold px-4 py-3 rounded-xl hover:from-orange-500 hover:to-orange-600 transition shadow-md shadow-orange-100 disabled:opacity-70"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Ativando...</>
      ) : (
        <><Bell className="w-4 h-4" /> Ativar notificações no celular</>
      )}
    </button>
  );
}
