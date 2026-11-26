/**
 * Sistema de Push Notifications 100% próprio usando Web Push API + VAPID
 * Sem Firebase, sem Google, sem nenhuma empresa externa.
 * 
 * Como funciona:
 * 1. O servidor gera suas próprias chaves VAPID (uma vez só)
 * 2. O navegador do comerciante se inscreve para receber notificações
 * 3. O servidor envia diretamente via protocolo Web Push padrão (W3C)
 * 4. O service worker do navegador exibe a notificação, mesmo com app fechado
 */
import * as webpush from "web-push";

// Configura as chaves VAPID do próprio servidor
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || "admin@agenda-e-dolphin.com"}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Envia notificação push diretamente pelo servidor
 */
export async function sendPushNotification({
  subscription,
  title,
  body,
  data,
}: {
  subscription: PushSubscriptionData;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("[PushNotification] Chaves VAPID não configuradas no .env");
    return { success: false, reason: "vapid_not_configured" };
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, data, icon: "/icon-192.png" })
    );
    return { success: true };
  } catch (error: any) {
    // Subscription expirada ou inválida
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, reason: "subscription_expired" };
    }
    console.error("[PushNotification] Erro:", error.message);
    return { success: false, error: error.message };
  }
}
