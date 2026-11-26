import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushNotification, PushSubscriptionData } from "@/lib/push-notifications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function POST(req: NextRequest) {
  try {
    const { businessId, timeSlotId, date, clientName, clientPhone, message } =
      await req.json();

    if (!businessId || !timeSlotId || !date) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const bookingDate = new Date(date);

    // Verifica se o slot ainda está disponível
    const conflict = await prisma.booking.findFirst({
      where: { timeSlotId, date: bookingDate, status: { not: "CANCELLED" } },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "Este horário já foi reservado. Escolha outro." },
        { status: 409 }
      );
    }

    // Cria o agendamento
    const booking = await prisma.booking.create({
      data: {
        businessId,
        timeSlotId,
        date: bookingDate,
        clientName: clientName?.trim() || null,
        clientPhone: clientPhone?.trim() || null,
        message: message?.trim() || null,
        status: "CONFIRMED",
      },
      include: {
        business: { include: { user: true } },
        timeSlot: true,
      },
    });

    // Envia push notification via servidor próprio (sem Firebase)
    if (booking.business.user.pushSubscription) {
      const sub = JSON.parse(booking.business.user.pushSubscription) as PushSubscriptionData;
      const dateFormatted = format(bookingDate, "dd/MM/yyyy", { locale: ptBR });
      const clientInfo = booking.clientName || "Cliente";

      const result = await sendPushNotification({
        subscription: sub,
        title: "🗓️ Novo Agendamento!",
        body: `${clientInfo} agendou para ${dateFormatted} às ${booking.timeSlot.startTime}`,
        data: { bookingId: booking.id, type: "new_booking" },
      });

      // Remove subscription expirada
      if (!result.success && result.reason === "subscription_expired") {
        await prisma.user.update({
          where: { id: booking.business.user.id },
          data: { pushSubscription: null },
        });
      }
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
