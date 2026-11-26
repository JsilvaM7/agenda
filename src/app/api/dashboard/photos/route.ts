import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/photos
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) return NextResponse.json([], { status: 200 });

    const photos = await prisma.photo.findMany({
      where: { businessId: business.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(photos);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
