import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications/vapid-key — retorna a chave pública VAPID para o front-end
export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY || "",
  });
}

// POST /api/notifications/subscribe — salva a subscription do navegador
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const subscription = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Subscription inválida" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    await prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: JSON.stringify(subscription) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/notifications/subscribe — remove a subscription (desativar notificações)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    await prisma.user.update({
      where: { id: userId },
      data: { pushSubscription: null },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
