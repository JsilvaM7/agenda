import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// POST /api/photos — upload de foto (comerciante autenticado)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const business = await prisma.business.findUnique({ where: { userId } });
    if (!business) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    // Verifica limite de 30 fotos
    const photoCount = await prisma.photo.count({ where: { businessId: business.id } });
    if (photoCount >= 30) {
      return NextResponse.json({ error: "Limite de 30 fotos atingido" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo não permitido" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 5MB)" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", business.slug);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${business.slug}/${filename}`;

    const photo = await prisma.photo.create({
      data: {
        businessId: business.id,
        url,
        filename,
        order: photoCount,
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE /api/photos/[id]
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "merchant") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");
    if (!photoId) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

    const userId = (session.user as any).id;
    const business = await prisma.business.findUnique({ where: { userId } });

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, businessId: business?.id },
    });

    if (!photo) return NextResponse.json({ error: "Foto não encontrada" }, { status: 404 });

    await prisma.photo.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
