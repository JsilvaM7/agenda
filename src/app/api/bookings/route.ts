import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { sendPushNotification } from "@/lib/firebase-admin";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// POST /api/bookings — criar agendamento (público, sem autenticação)
export async function POST(req: NextRequest) {
  try {
    const { businessId, timeSlotId, date, clientName, clientPhone, message } =
      await req.json();

    if (!businessId || !timeSlotId || !date) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const bookingDate = new Date(date);

    // Verifica se o slot ainda está disponível
    const existingBooking = await prisma.booking.findFirst({
      where: {
        timeSlotId,
        date: bookingDate,
        status: { not: "CANCELLED" },
      },
    });

    if (existingBooking) {
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
        clientName: clientName || null,
        clientPhone: clientPhone || null,
        message: message || null,
        status: "CONFIRMED",
      },
      include: {
        business: { include: { user: true } },
        timeSlot: true,
      },
    });

    // Envia notificação push para o comerciante
    if (booking.business.user.fcmToken) {
      const dateFormatted = format(bookingDate, "dd/MM/yyyy", { locale: ptBR });
      const clientInfo = booking.clientName || "Cliente";

      await sendPushNotification({
        fcmToken: booking.business.user.fcmToken,
        title: "🗓️ Novo Agendamento!",
        body: `${clientInfo} agendou para ${dateFormatted} às ${booking.timeSlot.startTime}`,
        data: {
          bookingId: booking.id,
          type: "new_booking",
        },
      });
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
