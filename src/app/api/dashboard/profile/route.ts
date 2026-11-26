import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/dashboard/profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const business = await prisma.business.findUnique({ where: { userId } });
    return NextResponse.json(business || {});
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT /api/dashboard/profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { description, phone } = await req.json();
    const userId = (session.user as any).id;
    await prisma.business.update({
      where: { userId },
      data: { description, phone },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
