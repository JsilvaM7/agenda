import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/slots
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json([]);

    const slots = await prisma.timeSlot.findMany({
      where: { businessId: business.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return NextResponse.json(slots);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/dashboard/slots — atualiza quais slots estão ativos
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { slots } = await req.json();
    const updates = slots.map((slot: { id: string; active: boolean }) =>
      prisma.timeSlot.update({
        where: { id: slot.id },
        data: { active: slot.active },
      })
    );
    await Promise.all(updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
