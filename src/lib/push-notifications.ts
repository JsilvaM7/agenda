import * as webpush from "web-push";

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

function initVapid() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return false;
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL || "admin@agenda-e-dolphin.com"}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    return true;
  } catch {
    return false;
  }
}

export async function sendPushNotification({
  subscription, title, body, data,
}: {
  subscription: PushSubscriptionData;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  if (!initVapid()) {
    console.warn("[Push] VAPID keys not configured");
    return { success: false, reason: "vapid_not_configured" };
  }
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, data, icon: "/icon-192.png" })
    );
    return { success: true };
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, reason: "subscription_expired" };
    }
    console.error("[Push] Erro:", error.message);
    return { success: false, error: error.message };
  }
}
