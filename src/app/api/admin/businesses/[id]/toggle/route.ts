import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.business.update({
    where: { id },
    data: { active: !business.active },
  });
  return NextResponse.json({ success: true, active: !business.active });
}
