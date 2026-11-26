import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

function getFirebaseApp() {
  // Inicializa apenas se as credenciais existirem e ainda não foi inicializado
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Em build/dev sem credenciais, retorna null (notificações desativadas)
  if (!projectId || !clientEmail || !privateKey) return null;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

/**
 * Envia notificação push para o comerciante via FCM.
 * Se o Firebase não estiver configurado, apenas loga e retorna sem erro.
 */
export async function sendPushNotification({
  fcmToken,
  title,
  body,
  data,
}: {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  try {
    const app = getFirebaseApp();
    if (!app) {
      console.warn("[FCM] Firebase não configurado — notificação ignorada.");
      return { success: false, reason: "not_configured" };
    }

    const messaging = getMessaging(app);
    await messaging.send({
      token: fcmToken,
      notification: { title, body },
      data,
      android: {
        priority: "high",
        notification: { sound: "default", channelId: "agenda_notifications" },
      },
      apns: {
        payload: { aps: { sound: "default", badge: 1 } },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar push notification:", error);
    return { success: false, error };
  }
}
