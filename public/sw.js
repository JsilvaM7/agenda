/**
 * Service Worker — Agenda
 * Recebe e exibe notificações push mesmo com o app fechado.
 * 100% próprio, sem Firebase.
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Agenda", body: event.data.text() };
  }

  const { title, body, icon, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title || "Agenda", {
      body: body || "",
      icon: icon || "/icon-192.png",
      badge: "/icon-96.png",
      vibrate: [200, 100, 200],
      data: data || {},
      actions: [
        { action: "open", title: "Abrir Agenda" },
        { action: "dismiss", title: "Dispensar" },
      ],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Se já tem uma janela aberta, foca nela
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        // Senão abre o dashboard
        return clients.openWindow("/dashboard");
      })
  );
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});
