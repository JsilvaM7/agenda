import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/token — salva FCM token do comerciante
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { fcmToken } = await req.json();
    if (!fcmToken) {
      return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
