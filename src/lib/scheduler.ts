import cron from "node-cron";
import { prisma } from "./prisma";
import { sendPushNotification, PushSubscriptionData } from "./push-notifications";
import { format, endOfMonth, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

let isSchedulerRunning = false;

export function startReminderScheduler() {
  if (isSchedulerRunning) return;
  isSchedulerRunning = true;

  // ── Lembrete 30min antes ── roda a cada minuto
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const thirtyFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      const windowStart = new Date(thirtyFromNow.getTime() - 60 * 1000);
      const windowEnd   = new Date(thirtyFromNow.getTime() + 60 * 1000);

      const upcoming = await prisma.booking.findMany({
        where: {
          date: { gte: windowStart, lte: windowEnd },
          status: { not: "CANCELLED" },
          reminderSent: false,
        },
        include: { business: { include: { user: true } }, timeSlot: true },
      });

      for (const booking of upcoming) {
        const { user } = booking.business;
        if (!user.pushSubscription) continue;

        const clientName = booking.clientName || "Cliente";
        const sub = JSON.parse(user.pushSubscription) as PushSubscriptionData;

        const result = await sendPushNotification({
          subscription: sub,
          title: "⏰ Lembrete de Agendamento",
          body: `${clientName} tem um agendamento em 30 minutos (${booking.timeSlot.startTime})`,
          data: { bookingId: booking.id, type: "reminder" },
        });

        // Remove subscription expirada do banco
        if (!result.success && result.reason === "subscription_expired") {
          await prisma.user.update({
            where: { id: user.id },
            data: { pushSubscription: null },
          });
        }

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });
      }
    } catch (err) {
      console.error("[Scheduler] Erro no lembrete:", err);
    }
  });

  // ── Geração de faturas mensais ── último dia do mês às 23:59
  cron.schedule("59 23 28-31 * *", async () => {
    const now = new Date();
    if (now.getDate() !== endOfMonth(now).getDate()) return;

    try {
      const month      = now.getMonth() + 1;
      const year       = now.getFullYear();
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd   = endOfMonth(now);
      const dueDate    = addDays(monthEnd, 10);

      const businesses = await prisma.business.findMany({ where: { active: true } });

      for (const biz of businesses) {
        const bookingCount = await prisma.booking.count({
          where: {
            businessId: biz.id,
            status: "CONFIRMED",
            date: { gte: monthStart, lte: monthEnd },
            invoiced: false,
          },
        });
        if (bookingCount === 0) continue;

        const amountCents = bookingCount * 100;
        await prisma.invoice.upsert({
          where: { businessId_month_year: { businessId: biz.id, month, year } },
          update: { bookingCount, amountCents },
          create: { businessId: biz.id, month, year, bookingCount, amountCents, dueDate, status: "PENDING" },
        });

        await prisma.booking.updateMany({
          where: { businessId: biz.id, status: "CONFIRMED", date: { gte: monthStart, lte: monthEnd }, invoiced: false },
          data: { invoiced: true },
        });
      }
    } catch (err) {
      console.error("[Scheduler] Erro na geração de faturas:", err);
    }
  });

  // ── Verifica faturas vencidas ── todo dia às 8h
  cron.schedule("0 8 * * *", async () => {
    try {
      await prisma.invoice.updateMany({
        where: { status: "PENDING", dueDate: { lt: new Date() } },
        data: { status: "OVERDUE" },
      });

      const overdue = await prisma.invoice.findMany({
        where: { status: "OVERDUE" },
        include: { business: { include: { user: true } } },
      });

      for (const inv of overdue) {
        if (!inv.business.suspended) {
          await prisma.business.update({
            where: { id: inv.businessId },
            data: { suspended: true, active: false },
          });

          if (inv.business.user.pushSubscription) {
            const sub = JSON.parse(inv.business.user.pushSubscription) as PushSubscriptionData;
            await sendPushNotification({
              subscription: sub,
              title: "⛔ Conta Agenda pausada",
              body: `Sua conta foi suspensa por falta de pagamento. Fatura: R$${(inv.amountCents / 100).toFixed(2)}. Contate o suporte.`,
              data: { type: "account_suspended" },
            });
          }
        }
      }
    } catch (err) {
      console.error("[Scheduler] Erro na verificação de faturas:", err);
    }
  });

  console.log("✅ Agendadores iniciados: lembretes + faturas + suspensão");
}
