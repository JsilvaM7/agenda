import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const business = await prisma.business.findUnique({
      where: { slug, active: true },
      include: {
        timeSlots: { where: { active: true }, orderBy: { dayOfWeek: "asc" } },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id:          business.id,
      name:        business.name,
      description: business.description,
      category:    business.category,
      phone:       business.phone,
      timeSlots:   business.timeSlots,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
