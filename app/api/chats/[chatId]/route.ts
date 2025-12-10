import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET метод для получения истории чата
export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST метод для добавления сообщения
export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;
    
    // Читаем тело запроса
    const body = await req.json();
    
    // Логируем, что пришло (потом удалишь console.log)
    console.log("Saving message to DB:", body);

    const { role, content, attachedCode, attachedFileName } = body;

    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
        // Явно указываем поля, даже если они undefined (Prisma съест null)
        attachedCode: attachedCode || null,
        attachedFileName: attachedFileName || null,
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
