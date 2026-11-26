import cron from "node-cron";
import { prisma } from "./prisma";
import { sendPushNotification } from "./firebase-admin";
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
      const windowEnd = new Date(thirtyFromNow.getTime() + 60 * 1000);

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
        if (!user.fcmToken) continue;
        const clientName = booking.clientName || "Cliente";
        await sendPushNotification({
          fcmToken: user.fcmToken,
          title: "⏰ Lembrete de Agendamento",
          body: `${clientName} tem um agendamento em 30 minutos (${booking.timeSlot.startTime})`,
          data: { bookingId: booking.id, type: "reminder" },
        });
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });
      }
    } catch (err) {
      console.error("Erro no lembrete:", err);
    }
  });

  // ── Geração de faturas mensais ── roda às 23:59 do último dia do mês
  cron.schedule("59 23 28-31 * *", async () => {
    const now = new Date();
    const lastDay = endOfMonth(now);
    // Só executa se for o último dia do mês
    if (now.getDate() !== lastDay.getDate()) return;

    try {
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = endOfMonth(now);
      const dueDate = addDays(endOfMonth(now), 10); // vence 10 dias depois

      const businesses = await prisma.business.findMany({
        where: { active: true },
      });

      for (const biz of businesses) {
        // Conta agendamentos confirmados no mês
        const bookingCount = await prisma.booking.count({
          where: {
            businessId: biz.id,
            status: "CONFIRMED",
            date: { gte: monthStart, lte: monthEnd },
            invoiced: false,
          },
        });

        if (bookingCount === 0) continue;

        const amountCents = bookingCount * 100; // R$1,00 por agendamento

        // Cria ou atualiza fatura
        await prisma.invoice.upsert({
          where: { businessId_month_year: { businessId: biz.id, month, year } },
          update: { bookingCount, amountCents },
          create: {
            businessId: biz.id,
            month,
            year,
            bookingCount,
            amountCents,
            dueDate,
            status: "PENDING",
          },
        });

        // Marca agendamentos como faturados
        await prisma.booking.updateMany({
          where: {
            businessId: biz.id,
            status: "CONFIRMED",
            date: { gte: monthStart, lte: monthEnd },
            invoiced: false,
          },
          data: { invoiced: true },
        });

        console.log(
          `Fatura gerada: ${biz.name} — ${bookingCount} agendamentos — R$${(amountCents / 100).toFixed(2)}`
        );
      }
    } catch (err) {
      console.error("Erro na geração de faturas:", err);
    }
  });

  // ── Verifica faturas vencidas ── roda diariamente às 8h
  cron.schedule("0 8 * * *", async () => {
    try {
      const now = new Date();

      // Marca faturas vencidas
      await prisma.invoice.updateMany({
        where: { status: "PENDING", dueDate: { lt: now } },
        data: { status: "OVERDUE" },
      });

      // Suspende contas com faturas vencidas
      const overdueInvoices = await prisma.invoice.findMany({
        where: { status: "OVERDUE" },
        include: { business: { include: { user: true } } },
      });

      for (const inv of overdueInvoices) {
        if (!inv.business.suspended) {
          await prisma.business.update({
            where: { id: inv.businessId },
            data: { suspended: true, active: false },
          });

          // Notifica comerciante
          if (inv.business.user.fcmToken) {
            await sendPushNotification({
              fcmToken: inv.business.user.fcmToken,
              title: "⛔ Conta Agenda pausada",
              body: `Sua conta foi suspensa por falta de pagamento. Fatura: R$${(inv.amountCents / 100).toFixed(2)}. Contate o suporte.`,
              data: { type: "account_suspended" },
            });
          }
          console.log(`Conta suspensa: ${inv.business.name}`);
        }
      }
    } catch (err) {
      console.error("Erro na verificação de faturas:", err);
    }
  });

  console.log("✅ Agendadores iniciados: lembretes + faturas + suspensão");
}
