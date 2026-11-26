import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json({ error: "Data obrigatória" }, { status: 400 });
    }

    const date = new Date(dateStr + "T00:00:00");
    const dayOfWeek = date.getDay();

    const business = await prisma.business.findUnique({
      where: { slug, active: true },
      include: {
        timeSlots: {
          where: { dayOfWeek, active: true },
          orderBy: { startTime: "asc" },
        },
        bookings: {
          where: {
            date: { gte: startOfDay(date), lte: endOfDay(date) },
            status: { not: "CANCELLED" },
          },
          select: { timeSlotId: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const bookedSlotIds = new Set(business.bookings.map((b) => b.timeSlotId));

    const slots = business.timeSlots.map((slot) => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: !bookedSlotIds.has(slot.id),
    }));

    return NextResponse.json({ slots });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
