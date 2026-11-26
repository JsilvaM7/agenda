import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, businessName, slug, category, phone } =
      await req.json();

    if (!name || !email || !password || !businessName || !slug) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    // Verifica se email já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    // Verifica se slug já existe
    const existingBusiness = await prisma.business.findUnique({
      where: { slug },
    });
    if (existingBusiness) {
      return NextResponse.json(
        { error: "Este nome de empresa já está em uso. Tente outro." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Cria usuário e empresa
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        business: {
          create: {
            name: businessName,
            slug,
            category,
            phone,
            // Horários padrão: Seg-Sex 9h às 18h, 30min cada
            timeSlots: {
              create: generateDefaultSlots(),
            },
          },
        },
      },
      include: { business: true },
    });

    return NextResponse.json({
      success: true,
      slug: user.business?.slug,
    });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

function generateDefaultSlots() {
  const slots = [];
  // Segunda a Sexta (1-5), 09:00 às 17:30, blocos de 30min
  for (let day = 1; day <= 5; day++) {
    for (let hour = 9; hour < 18; hour++) {
      for (const min of [0, 30]) {
        if (hour === 17 && min === 30) continue;
        const start = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        const endMin = min + 30 >= 60 ? 0 : min + 30;
        const endHour = min + 30 >= 60 ? hour + 1 : hour;
        const end = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;
        slots.push({ dayOfWeek: day, startTime: start, endTime: end });
      }
    }
  }
  return slots;
}
