import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateDefaultSlots() {
  const slots = [];
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

export async function POST(req: NextRequest) {
  try {
    const { businessName, password } = await req.json();

    if (!businessName || !password) {
      return NextResponse.json(
        { error: "Nome do serviço e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha precisa ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const slug = slugify(businessName);

    if (!slug) {
      return NextResponse.json(
        { error: "Nome de serviço inválido" },
        { status: 400 }
      );
    }

    // Verifica se slug já existe
    const existingBusiness = await prisma.business.findUnique({ where: { slug } });
    if (existingBusiness) {
      return NextResponse.json(
        { error: "Este nome de serviço já está em uso. Tente outro." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: businessName,
        password: hashedPassword,
        business: {
          create: {
            name: businessName,
            slug,
            timeSlots: {
              create: generateDefaultSlots(),
            },
          },
        },
      },
      include: { business: true },
    });

    return NextResponse.json({ success: true, slug: user.business?.slug });
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
