import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET метод оставляем как был...

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    // Добавляем attachedCode и attachedFileName в деструктуризацию
    const { role, content, attachedCode, attachedFileName } = await req.json();

    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
        // Сохраняем новые поля
        attachedCode,
        attachedFileName,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
