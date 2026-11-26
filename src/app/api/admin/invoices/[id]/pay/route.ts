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

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { business: true },
  });
  if (!invoice) return NextResponse.json({ error: "Fatura não encontrada" }, { status: 404 });

  await prisma.invoice.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });

  const otherOverdue = await prisma.invoice.count({
    where: { businessId: invoice.businessId, status: "OVERDUE", id: { not: id } },
  });

  if (otherOverdue === 0 && invoice.business.suspended) {
    await prisma.business.update({
      where: { id: invoice.businessId },
      data: { suspended: false, active: true },
    });
  }

  return NextResponse.json({ success: true });
}
